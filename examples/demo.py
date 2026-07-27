#!/usr/bin/env python3
"""
AI Agent Fleet Platform - Demo Script
This script demonstrates the platform's capabilities with example agents.
"""

import json
import requests
import time
from datetime import datetime
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000/api/v1"
API_KEY = "demo_api_key_123456"  # Would be actual API key in production


class AgentFleetDemo:
    """Demonstration of AI Agent Fleet Platform capabilities"""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
    
    def create_conversational_agent(self) -> Dict[str, Any]:
        """Create a conversational customer support agent"""
        print("🚀 Creating conversational customer support agent...")
        
        agent_data = {
            "name": "Customer Support Bot",
            "description": "Handles customer inquiries and support tickets",
            "type": "conversational",
            "llm_provider": "openai",
            "llm_model": "gpt-4",
            "llm_temperature": 0.7,
            "llm_max_tokens": 1000,
            "llm_system_prompt": "You are a helpful customer support agent. Be professional, friendly, and solution-oriented.",
            "available_tools": ["web_search", "database_query", "ticket_system"],
            "max_concurrent_tasks": 5,
            "execution_strategy": "sequential",
            "timeout_seconds": 120
        }
        
        response = requests.post(
            f"{self.base_url}/agents",
            headers=self.headers,
            json=agent_data
        )
        
        if response.status_code == 201:
            agent = response.json()
            print(f"✅ Created agent: {agent['name']} (ID: {agent['id']})")
            return agent
        else:
            print(f"❌ Failed to create agent: {response.text}")
            return {}
    
    def create_monitoring_agent(self) -> Dict[str, Any]:
        """Create a website monitoring agent"""
        print("🚀 Creating website monitoring agent...")
        
        agent_data = {
            "name": "Website Uptime Monitor",
            "description": "Monitors website availability and performance",
            "type": "monitoring",
            "llm_provider": "none",  # Rule-based agent
            "available_tools": ["http_check", "performance_metrics", "alert_system"],
            "tool_configs": {
                "http_check": {
                    "check_interval_seconds": 60,
                    "timeout_seconds": 10,
                    "expected_status_codes": [200, 301, 302]
                }
            },
            "max_concurrent_tasks": 10,
            "execution_strategy": "parallel",
            "timeout_seconds": 30
        }
        
        response = requests.post(
            f"{self.base_url}/agents",
            headers=self.headers,
            json=agent_data
        )
        
        if response.status_code == 201:
            agent = response.json()
            print(f"✅ Created agent: {agent['name']} (ID: {agent['id']})")
            return agent
        else:
            print(f"❌ Failed to create agent: {response.text}")
            return {}
    
    def create_research_agent(self) -> Dict[str, Any]:
        """Create a data research agent"""
        print("🚀 Creating data research agent...")
        
        agent_data = {
            "name": "Market Research Analyst",
            "description": "Analyzes market data and generates reports",
            "type": "data_research",
            "llm_provider": "openai",
            "llm_model": "gpt-4",
            "llm_temperature": 0.5,
            "available_tools": ["data_query", "statistical_analysis", "chart_generate", "report_builder"],
            "data_sources": ["market_data", "customer_data", "competitor_data"],
            "data_access_rules": {
                "customer_data": "aggregated_only",
                "financial_data": "requires_approval"
            },
            "max_concurrent_tasks": 2,
            "max_tokens_per_month": 500000,
            "execution_strategy": "sequential",
            "timeout_seconds": 300
        }
        
        response = requests.post(
            f"{self.base_url}/agents",
            headers=self.headers,
            json=agent_data
        )
        
        if response.status_code == 201:
            agent = response.json()
            print(f"✅ Created agent: {agent['name']} (ID: {agent['id']})")
            return agent
        else:
            print(f"❌ Failed to create agent: {response.text}")
            return {}
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents"""
        print("📋 Listing all agents...")
        
        response = requests.get(
            f"{self.base_url}/agents",
            headers=self.headers,
            params={"limit": 10}
        )
        
        if response.status_code == 200:
            data = response.json()
            agents = data.get("items", [])
            print(f"✅ Found {len(agents)} agents:")
            for agent in agents:
                print(f"   • {agent['name']} ({agent['type']}) - {agent['status']}")
            return agents
        else:
            print(f"❌ Failed to list agents: {response.text}")
            return []
    
    def execute_agent(self, agent_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute an agent with input data"""
        print(f"⚡ Executing agent {agent_id}...")
        
        execution_request = {
            "input_data": input_data,
            "session_id": f"demo_{datetime.now().isoformat()}",
            "request_id": f"req_{int(time.time())}"
        }
        
        response = requests.post(
            f"{self.base_url}/agents/{agent_id}/execute",
            headers=self.headers,
            json=execution_request
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Execution completed:")
            print(f"   • Execution ID: {result.get('execution_id')}")
            print(f"   • Status: {result.get('status')}")
            print(f"   • Time: {result.get('execution_time_ms', 0)}ms")
            return result
        else:
            print(f"❌ Failed to execute agent: {response.text}")
            return {}
    
    def demonstrate_agent_types(self):
        """Demonstrate different agent types with example executions"""
        print("\n" + "="*60)
        print("🤖 AI AGENT FLEET PLATFORM - DEMONSTRATION")
        print("="*60)
        
        # Create agents
        agents = []
        
        # Create different types of agents
        support_agent = self.create_conversational_agent()
        if support_agent:
            agents.append(support_agent)
        
        monitoring_agent = self.create_monitoring_agent()
        if monitoring_agent:
            agents.append(monitoring_agent)
        
        research_agent = self.create_research_agent()
        if research_agent:
            agents.append(research_agent)
        
        if not agents:
            print("❌ No agents were created. Exiting demo.")
            return
        
        # List all agents
        print("\n" + "-"*60)
        self.list_agents()
        
        # Demonstrate agent execution
        print("\n" + "-"*60)
        print("🎯 Demonstrating Agent Execution")
        print("-"*60)
        
        # Execute conversational agent
        if support_agent:
            print("\n1. Conversational Agent Example:")
            result = self.execute_agent(
                support_agent["id"],
                {
                    "message": "Hello, I'm having trouble with my account login.",
                    "customer_id": "cust_123456",
                    "issue_type": "login"
                }
            )
        
        # Execute monitoring agent
        if monitoring_agent:
            print("\n2. Monitoring Agent Example:")
            result = self.execute_agent(
                monitoring_agent["id"],
                {
                    "url": "https://example.com",
                    "check_type": "uptime",
                    "alert_on_failure": True
                }
            )
        
        # Execute research agent
        if research_agent:
            print("\n3. Research Agent Example:")
            result = self.execute_agent(
                research_agent["id"],
                {
                    "research_topic": "AI market trends 2024",
                    "data_sources": ["market_data", "industry_reports"],
                    "output_format": "summary_report"
                }
            )
        
        # Show platform capabilities
        print("\n" + "-"*60)
        print("🏗️  Platform Capabilities")
        print("-"*60)
        print("""
✅ Multi-Tenant Architecture
   • Isolated environments for different customers
   • Custom resource limits and quotas
   • White-label capabilities

✅ Agent Management
   • Create, update, delete agents
   • Agent templates and cloning
   • Version control for configurations

✅ Tool Integration
   • Pre-built tools (web search, database, APIs)
   • Custom tool development
   • Tool permissions and scopes

✅ Data Access Control
   • Granular data source permissions
   • Data access rules and policies
   • Audit trails for data access

✅ Monitoring & Analytics
   • Real-time agent performance tracking
   • Cost tracking and optimization
   • Usage analytics and reporting

✅ Security & Compliance
   • Enterprise-grade security
   • Multi-factor authentication
   • Audit logs and compliance reports

✅ Scalability
   • Horizontal scaling for high throughput
   • Load balancing and auto-scaling
   • Cloud-native architecture
        """)
        
        print("\n" + "="*60)
        print("🎉 DEMONSTRATION COMPLETE")
        print("="*60)
        print("\nThe AI Agent Fleet Platform provides a comprehensive solution for")
        print("enterprise AI agent orchestration with features for:")
        print("• Legitimate business automation")
        print("• Compliant web operations")
        print("• Scalable agent deployment")
        print("• Cost-effective AI utilization")
        print("\nReady to build your agent fleet? 🚀")


def main():
    """Main demo execution"""
    print("Starting AI Agent Fleet Platform demo...")
    print(f"Base URL: {BASE_URL}")
    print("This demo creates example agents and demonstrates platform capabilities.")
    
    demo = AgentFleetDemo()
    demo.demonstrate_agent_types()


if __name__ == "__main__":
    main()