from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task, before_kickoff, after_kickoff
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List, Dict, Any
import os
import logging
import yaml
from dotenv import load_dotenv
from datetime import datetime

# Enable comprehensive logging
logging.basicConfig(level=logging.DEBUG)
os.environ["CREWAI_LOG_LEVEL"] = "DEBUG"

# Load environment variables
load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
FORCE_LOCAL_CREW = os.environ.get('FORCE_LOCAL_CREW', os.environ.get('FORCE_LOCAL_CREW'.upper(), '0')).lower() in ('1', 'true', 'yes')
if not FORCE_LOCAL_CREW:
    if not openai_key:
        raise ValueError("OPENAI_API_KEY not found! Please check your .env file or set FORCE_LOCAL_CREW=1 to run in local mode.")
    print("\U00002705 OPENAI_API_KEY loaded successfully")
else:
    print('[CREW] Running in FORCE_LOCAL_CREW mode: external OpenAI calls will be avoided')

# YAML loader
def load_yaml(file_name):
    base_path = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(base_path, "config", file_name)
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

# Safety and ethics guardrail function
def safety_and_ethics_check(output: str) -> str:
    """Validate output meets safety and ethical standards"""
    risk_indicators = [
        "self-harm", "suicide", "severe depression", "crisis", 
        "emergency", "danger", "harm", "violence"
    ]
    
    output_lower = output.lower()
    if any(indicator in output_lower for indicator in risk_indicators):
        return "REQUIRES_PROFESSIONAL_REFERRAL"
    return "APPROVED"

# Step callback for monitoring
def step_callback(step):
    """Monitor each step for safety and quality"""
    print(f"🔍 Monitoring step: {step.action}")
    if hasattr(step, 'result'):
        safety_check = safety_and_ethics_check(str(step.result))
        if safety_check == "REQUIRES_PROFESSIONAL_REFERRAL":
            print("⚠️ Safety concern detected - flagging for review")

# LLM configurations for different purposes
def get_llm_config(model_type: str) -> LLM:
    """Get optimized LLM configuration based on purpose"""
    # If forced local mode, return a minimal LLM shim to avoid external calls.
    if FORCE_LOCAL_CREW:
        return LLM(model="local-shim", temperature=0.0, max_tokens=256, timeout=1)
    configs = {
            "empathy": LLM(
                model="gpt-4o",
                temperature=0.7,
                max_tokens=4000,
                timeout=300,
            ),
            "analysis": LLM(
                model="gpt-4o",
                temperature=0.3,
                max_tokens=4000,
                timeout=300,
            ),
            "reasoning": LLM(
                model="gpt-4o",
                temperature=0.2,
                max_tokens=4000,
                timeout=300,
            ),
            "creative": LLM(
                model="gpt-4o",
                temperature=0.8,
                max_tokens=4000,
                timeout=300,
            )
        }
    
    return configs.get(model_type, configs["analysis"])

@CrewBase
class EnhancedEmotionalSupportCrew:
    """Enhanced Emotional Support System with Evidence-Based Interventions"""
    
    agents_config: dict
    tasks_config: dict
    agents: List[BaseAgent]
    tasks: List[Task]

    def __init__(self, inputs=None):
        self.agents_config = load_yaml("agents.yaml")
        self.tasks_config = load_yaml("tasks.yaml")
        self.inputs = inputs or {}
        
        # Add current year for research relevance
        self.inputs['current_year'] = datetime.now().year

    @before_kickoff
    def prepare_inputs(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare and validate inputs before crew execution"""
        # Ensure required inputs are present
        if 'emotion' not in inputs:
            raise ValueError("Emotion input is required")
        
        # Add current year for research relevance
        inputs['current_year'] = datetime.now().year
        
        # Log the start of emotional support process
        print(f"🚀 Starting emotional support process for emotion: {inputs.get('emotion')}")
        
        return inputs

    @after_kickoff
    def process_output(self, output):
        """Process and validate output after crew execution"""
        # Perform final safety check
        safety_check = safety_and_ethics_check(str(output.raw))
        
        if safety_check == "REQUIRES_PROFESSIONAL_REFERRAL":
            output.raw += "\n\n⚠️ IMPORTANT: This response has been flagged for professional review. Please consider seeking help from a qualified mental health professional."
        
        # Add completion timestamp
        output.raw += f"\n\n✅ Support plan completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        print("✅ Emotional support process completed successfully")
        return output

    # Core Agents
    @agent
    def emotion_intake_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['emotion_intake_agent'],
            verbose=True,
            llm=get_llm_config("empathy"),
            allow_delegation=True,
            memory=True
        )

    @agent
    def evidence_based_strategy_analyzer(self) -> Agent:
        return Agent(
            config=self.agents_config['evidence_based_strategy_analyzer'],
            verbose=True,
            llm=get_llm_config("reasoning"),
            allow_delegation=False,
            memory=True
        )

    @agent
    def personalized_solution_generator(self) -> Agent:
        return Agent(
            config=self.agents_config['personalized_solution_generator'],
            verbose=True,
            llm=get_llm_config("creative"),
            allow_delegation=True,
            memory=True,
            allow_code_execution=False
        )

    @agent
    def trauma_informed_presenter(self) -> Agent:
        return Agent(
            config=self.agents_config['trauma_informed_presenter'],
            verbose=True,
            llm=get_llm_config("empathy"),
            allow_delegation=False,
            memory=True,
            multimodal=True
        )

    @agent
    def contextual_analysis_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['contextual_analysis_researcher'],
            verbose=True,
            llm=get_llm_config("analysis"),
            allow_delegation=True,
            memory=True
        )

   

    @agent
    def final_presenter_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['final_presenter_agent'],
            verbose=True,
            llm=get_llm_config("empathy"),
            allow_delegation=False,
            memory=True,
            multimodal=True
        )

   

    @agent
    def research_validation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config['research_validation_agent'],
            verbose=True,
            llm=get_llm_config("analysis"),
            allow_delegation=False,
            memory=True
        )

   

    # Enhanced Tasks
    @task
    def emotion_intake_task(self) -> Task:
        return Task(
            config=self.tasks_config['emotion_intake_task'],
            agent=self.emotion_intake_agent(),
            
        )

    @task
    def evidence_validation_task(self) -> Task:
        return Task(
            config=self.tasks_config['evidence_validation_task'],
            agent=self.evidence_based_strategy_analyzer(),
            context=[self.emotion_intake_task()],
            
        )

    @task
    def personalized_intervention_task(self) -> Task:
        return Task(
            config=self.tasks_config['personalized_intervention_task'],
            agent=self.personalized_solution_generator(),
            context=[self.emotion_intake_task(), self.evidence_validation_task()],
            
        )

    @task
    def trauma_informed_presentation_task(self) -> Task:
        return Task(
            config=self.tasks_config['trauma_informed_presentation_task'],
            agent=self.trauma_informed_presenter(),
            context=[self.personalized_intervention_task()],
            human_input=True,
           
        )

    @task
    def contextual_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['contextual_analysis_task'],
            agent=self.contextual_analysis_researcher(),
            context=[self.trauma_informed_presentation_task()],
           
        )

    
        

    @task
    def research_validation_review_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_validation_review_task'],
            agent=self.research_validation_agent(),
            context=[self.contextual_analysis_task()],
            output_file="output/research_validation.md"
        )

    
        

    @task
    def final_delivery_task(self) -> Task:
        return Task(
            config=self.tasks_config['final_delivery_task'],
            agent=self.final_presenter_agent(),
            context=[self.research_validation_review_task()],
            output_file="output/final_support_plan.md"
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,  # Automatically collected by @agent decorator
            tasks=self.tasks,    # Automatically collected by @task decorator
            process=Process.sequential,
            verbose=True,
            memory=True,
            
        )

