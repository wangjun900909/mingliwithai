#!/usr/bin/env python3
"""
MCP编排器SDK安装配置
"""

from setuptools import setup, find_packages
import os

# 读取README文件
def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

# 读取requirements
def read_requirements():
    requirements_path = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    if os.path.exists(requirements_path):
        with open(requirements_path, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip() and not line.startswith('#')]
    return [
        'aiohttp>=3.8.0',
    ]

setup(
    name="mcp-orchestrator-sdk",
    version="2.0.0",
    author="MCP Orchestrator Team",
    author_email="support@mcp-orchestrator.com",
    description="功能完整的Python SDK，用于集成MCP AI编排器服务，支持本地和Railway云部署",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/your-org/mcp-orchestrator-sdk",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Communications :: Chat",
        "Topic :: Office/Business :: Scheduling",
    ],
    python_requires=">=3.8",
    install_requires=read_requirements(),
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
            "black>=22.0.0",
            "isort>=5.10.0",
            "flake8>=5.0.0",
            "mypy>=1.0.0",
        ],
        "docs": [
            "sphinx>=5.0.0",
            "sphinx-rtd-theme>=1.0.0",
            "myst-parser>=0.18.0",
        ],
        "railway": [
            "aiohttp==3.9.3",
            "aiodns==3.0.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "mcp-sdk-examples=mcp_orchestrator_sdk.examples:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords=[
        "mcp", "orchestrator", "ai", "workflow", "automation", 
        "microservices", "async", "sdk", "client", "railway", 
        "wechat", "calendar", "ics", "batch-processing"
    ],
    project_urls={
        "Bug Reports": "https://github.com/your-org/mcp-orchestrator-sdk/issues",
        "Source": "https://github.com/your-org/mcp-orchestrator-sdk",
        "Documentation": "https://mcp-orchestrator-sdk.readthedocs.io/",
        "Railway Demo": "https://myaimcp-production.up.railway.app",
    },
) 