"""
Swarm Orchestrator — Broadcast, delegate, and collect agent outputs.
"""
import asyncio
import uuid
from typing import Dict, List, Callable, Any
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class AgentTask:
    task_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str = ""
    command: str = ""
    payload: Dict[str, Any] = field(default_factory=dict)
    priority: int = 5
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = "pending"

@dataclass
class AgentResult:
    task_id: str = ""
    agent_id: str = ""
    stdout: str = ""
    stderr: str = ""
    return_code: int = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())

class SwarmOrchestrator:
    def __init__(self):
        self.agents: Dict[str, Dict] = {}
        self.task_queue: asyncio.Queue = asyncio.Queue()
        self.results: Dict[str, AgentResult] = {}
        self.handlers: Dict[str, Callable] = {}
        self._running = False

    def register_agent(self, agent_id: str, capabilities: List[str], endpoint: str = ""):
        self.agents[agent_id] = {
            "id": agent_id,
            "capabilities": capabilities,
            "endpoint": endpoint,
            "status": "idle",
            "last_seen": datetime.utcnow().isoformat()
        }

    def register_handler(self, capability: str, handler: Callable):
        self.handlers[capability] = handler

    async def broadcast(self, command: str, payload: Dict[str, Any], targets: List[str] = None):
        targets = targets or list(self.agents.keys())
        tasks = []
        for aid in targets:
            task = AgentTask(agent_id=aid, command=command, payload=payload)
            tasks.append(self._dispatch(task))
        return await asyncio.gather(*tasks, return_exceptions=True)

    async def _dispatch(self, task: AgentTask):
        agent = self.agents.get(task.agent_id)
        if not agent:
            return AgentResult(task_id=task.task_id, agent_id=task.agent_id, stderr="Agent not found", return_code=1)
        handler = self.handlers.get(task.command)
        if not handler:
            return AgentResult(task_id=task.task_id, agent_id=task.agent_id, stderr="No handler", return_code=1)
        try:
            result = await handler(task.payload) if asyncio.iscoroutinefunction(handler) else handler(task.payload)
            return AgentResult(task_id=task.task_id, agent_id=task.agent_id, stdout=str(result), return_code=0)
        except Exception as e:
            return AgentResult(task_id=task.task_id, agent_id=task.agent_id, stderr=str(e), return_code=1)

    async def run(self):
        self._running = True
        while self._running:
            try:
                task = await asyncio.wait_for(self.task_queue.get(), timeout=1.0)
                result = await self._dispatch(task)
                self.results[task.task_id] = result
            except asyncio.TimeoutError:
                continue

    def stop(self):
        self._running = False
