import { supabase } from "@/integrations/supabase/client";

export interface Assessment {
  id: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  duration: number;
  questions_count: number;
  description: string;
  status: "active" | "inactive";
}

// Single source of truth for how many questions a generated assessment
// presents. Change this one value to resize every formula-generated
// assessment (see assessmentQuestions.ts) and their listed question counts.
export const TOTAL_QUESTIONS = 25;

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  difficulty: "easy" | "medium" | "hard";
}

// Generate 50+ assessments with proper categorization
export const assessmentsData: Assessment[] = [
  // Python Assessments
  { id: "python_easy_1", title: "Python Basics Fundamentals", category: "Python", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "Basic Python concepts and syntax", status: "active" },
  { id: "python_easy_2", title: "Python Data Types & Variables", category: "Python", difficulty: "easy", duration: 25, questions_count: 15, description: "Data types, variables, and basic operations", status: "active" },
  { id: "python_medium_1", title: "Python Control Flow", category: "Python", difficulty: "medium", duration: 45, questions_count: TOTAL_QUESTIONS, description: "Loops, conditionals, and flow control", status: "active" },
  { id: "python_medium_2", title: "Python Functions & Modules", category: "Python", difficulty: "medium", duration: 40, questions_count: TOTAL_QUESTIONS, description: "Functions, modules, and scoping", status: "active" },
  { id: "python_hard_1", title: "Python Advanced Topics", category: "Python", difficulty: "hard", duration: 60, questions_count: TOTAL_QUESTIONS, description: "Decorators, generators, and metaclasses", status: "active" },

  // AWS Assessments
  { id: "aws_easy_1", title: "AWS Cloud Fundamentals", category: "AWS", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "Basic AWS services and concepts", status: "active" },
  { id: "aws_easy_2", title: "AWS EC2 Basics", category: "AWS", difficulty: "easy", duration: 25, questions_count: 15, description: "EC2 instances and basic configuration", status: "active" },
  { id: "aws_medium_1", title: "AWS S3 & Storage", category: "AWS", difficulty: "medium", duration: 45, questions_count: 15, description: "S3, EBS, and storage solutions", status: "active" },
  { id: "aws_medium_2", title: "AWS VPC & Networking", category: "AWS", difficulty: "medium", duration: 40, questions_count: 15, description: "VPC, subnets, and security groups", status: "active" },
  { id: "aws_hard_1", title: "AWS Advanced Architecture", category: "AWS", difficulty: "hard", duration: 60, questions_count: 15, description: "Complex architectures and best practices", status: "active" },

  // SQL Assessments
  { id: "sql_easy_1", title: "SQL Basic Queries", category: "SQL", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "SELECT, INSERT, UPDATE, DELETE statements", status: "active" },
  { id: "sql_easy_2", title: "SQL Joins & Relationships", category: "SQL", difficulty: "easy", duration: 25, questions_count: 15, description: "JOIN operations and table relationships", status: "active" },
  { id: "sql_medium_1", title: "SQL Advanced Queries", category: "SQL", difficulty: "medium", duration: 45, questions_count: 15, description: "Subqueries, aggregations, and complex queries", status: "active" },
  { id: "sql_medium_2", title: "SQL Optimization", category: "SQL", difficulty: "medium", duration: 40, questions_count: 15, description: "Index optimization and query performance", status: "active" },
  { id: "sql_hard_1", title: "SQL Database Design", category: "SQL", difficulty: "hard", duration: 60, questions_count: 15, description: "Normalization, constraints, and design patterns", status: "active" },

  // JavaScript Assessments
  { id: "js_easy_1", title: "JavaScript Fundamentals", category: "JavaScript", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "Variables, functions, and basic syntax", status: "active" },
  { id: "js_easy_2", title: "JavaScript DOM Manipulation", category: "JavaScript", difficulty: "easy", duration: 25, questions_count: 15, description: "DOM events and element manipulation", status: "active" },
  { id: "js_medium_1", title: "JavaScript ES6+", category: "JavaScript", difficulty: "medium", duration: 45, questions_count: 15, description: "Modern JavaScript features", status: "active" },
  { id: "js_medium_2", title: "JavaScript Async Programming", category: "JavaScript", difficulty: "medium", duration: 40, questions_count: 15, description: "Promises, async/await, and callbacks", status: "active" },
  { id: "js_hard_1", title: "JavaScript Advanced Concepts", category: "JavaScript", difficulty: "hard", duration: 60, questions_count: 15, description: "Closures, prototypes, and design patterns", status: "active" },

  // Linux Assessments
  { id: "linux_easy_1", title: "Linux File System Basics", category: "Linux", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "File operations and basic commands", status: "active" },
  { id: "linux_easy_2", title: "Linux User Management", category: "Linux", difficulty: "easy", duration: 25, questions_count: 15, description: "Users, groups, and permissions", status: "active" },
  { id: "linux_medium_1", title: "Linux System Administration", category: "Linux", difficulty: "medium", duration: 45, questions_count: 15, description: "Process management and system monitoring", status: "active" },
  { id: "linux_medium_2", title: "Linux Networking", category: "Linux", difficulty: "medium", duration: 40, questions_count: 15, description: "Network configuration and troubleshooting", status: "active" },
  { id: "linux_hard_1", title: "Linux Security & Hardening", category: "Linux", difficulty: "hard", duration: 60, questions_count: 15, description: "Security policies and system hardening", status: "active" },

  // Docker Assessments
  { id: "docker_easy_1", title: "Docker Container Basics", category: "Docker", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "Basic container concepts and commands", status: "active" },
  { id: "docker_easy_2", title: "Docker Images & Registries", category: "Docker", difficulty: "easy", duration: 25, questions_count: 15, description: "Building and managing Docker images", status: "active" },
  { id: "docker_medium_1", title: "Docker Compose", category: "Docker", difficulty: "medium", duration: 45, questions_count: 15, description: "Multi-container applications", status: "active" },
  { id: "docker_medium_2", title: "Docker Networking", category: "Docker", difficulty: "medium", duration: 40, questions_count: 15, description: "Container networking and communication", status: "active" },
  { id: "docker_hard_1", title: "Docker Advanced Topics", category: "Docker", difficulty: "hard", duration: 60, questions_count: 15, description: "Kubernetes integration and orchestration", status: "active" },

  // React Assessments
  { id: "react_easy_1", title: "React Component Basics", category: "React", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "JSX, components, and props", status: "active" },
  { id: "react_easy_2", title: "React State Management", category: "React", difficulty: "easy", duration: 25, questions_count: 15, description: "useState and component state", status: "active" },
  { id: "react_medium_1", title: "React Hooks", category: "React", difficulty: "medium", duration: 45, questions_count: 15, description: "useEffect, useContext, and custom hooks", status: "active" },
  { id: "react_medium_2", title: "React Router", category: "React", difficulty: "medium", duration: 40, questions_count: 15, description: "Client-side routing and navigation", status: "active" },
  { id: "react_hard_1", title: "React Performance & Optimization", category: "React", difficulty: "hard", duration: 60, questions_count: 15, description: "Memoization, lazy loading, and optimization", status: "active" },

  // DevOps Assessments
  { id: "devops_easy_1", title: "DevOps Fundamentals", category: "DevOps", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "CI/CD basics and version control", status: "active" },
  { id: "devops_easy_2", title: "Git & Version Control", category: "DevOps", difficulty: "easy", duration: 25, questions_count: 15, description: "Git workflows and branching strategies", status: "active" },
  { id: "devops_medium_1", title: "CI/CD Pipelines", category: "DevOps", difficulty: "medium", duration: 45, questions_count: 15, description: "Jenkins, GitHub Actions, and automation", status: "active" },
  { id: "devops_medium_2", title: "Infrastructure as Code", category: "DevOps", difficulty: "medium", duration: 40, questions_count: 15, description: "Terraform and configuration management", status: "active" },
  { id: "devops_hard_1", title: "DevOps Advanced Practices", category: "DevOps", difficulty: "hard", duration: 60, questions_count: 15, description: "Microservices, monitoring, and scalability", status: "active" },

  // Cybersecurity Assessments
  { id: "security_easy_1", title: "Cybersecurity Fundamentals", category: "Security", difficulty: "easy", duration: 30, questions_count: TOTAL_QUESTIONS, description: "Basic security concepts and threats", status: "active" },
  { id: "security_easy_2", title: "Network Security Basics", category: "Security", difficulty: "easy", duration: 25, questions_count: 15, description: "Firewalls, VPNs, and basic protection", status: "active" },
  { id: "security_medium_1", title: "Ethical Hacking", category: "Security", difficulty: "medium", duration: 45, questions_count: 15, description: "Penetration testing and vulnerability assessment", status: "active" },
  { id: "security_medium_2", title: "Cryptography", category: "Security", difficulty: "medium", duration: 40, questions_count: 15, description: "Encryption, hashing, and digital signatures", status: "active" },
  { id: "security_hard_1", title: "Advanced Cybersecurity", category: "Security", difficulty: "hard", duration: 60, questions_count: 15, description: "Incident response and security architecture", status: "active" },

  // More assessments to reach 50+
  { id: "node_easy_1", title: "Node.js Fundamentals", category: "Node.js", difficulty: "easy", duration: 30, questions_count: 15, description: "Basic Node.js concepts", status: "active" },
  { id: "node_medium_1", title: "Express.js Framework", category: "Node.js", difficulty: "medium", duration: 45, questions_count: 15, description: "Express routing and middleware", status: "active" },
  { id: "node_hard_1", title: "Node.js Advanced", category: "Node.js", difficulty: "hard", duration: 60, questions_count: 15, description: "Streams, clustering, and performance", status: "active" },

  { id: "go_easy_1", title: "Go Programming Basics", category: "Go", difficulty: "easy", duration: 30, questions_count: 15, description: "Go syntax and basic concepts", status: "active" },
  { id: "go_medium_1", title: "Go Concurrency", category: "Go", difficulty: "medium", duration: 45, questions_count: 15, description: "Goroutines and channels", status: "active" },
  { id: "go_hard_1", title: "Go Advanced Topics", category: "Go", difficulty: "hard", duration: 60, questions_count: 15, description: "Advanced Go patterns and optimization", status: "active" },

  { id: "kubernetes_easy_1", title: "Kubernetes Basics", category: "Kubernetes", difficulty: "easy", duration: 30, questions_count: 15, description: "Pods, deployments, and services", status: "active" },
  { id: "kubernetes_medium_1", title: "Kubernetes Networking", category: "Kubernetes", difficulty: "medium", duration: 45, questions_count: 15, description: "Networking and service mesh", status: "active" },
  { id: "kubernetes_hard_1", title: "Kubernetes Advanced", category: "Kubernetes", difficulty: "hard", duration: 60, questions_count: 15, description: "Operators and custom resources", status: "active" },

  { id: "azure_easy_1", title: "Azure Cloud Fundamentals", category: "Azure", difficulty: "easy", duration: 30, questions_count: 15, description: "Basic Azure services", status: "active" },
  { id: "azure_medium_1", title: "Azure DevOps", category: "Azure", difficulty: "medium", duration: 45, questions_count: 15, description: "Azure pipelines and deployment", status: "active" },
  { id: "azure_hard_1", title: "Azure Architecture", category: "Azure", difficulty: "hard", duration: 60, questions_count: 15, description: "Complex Azure solutions", status: "active" },

  { id: "gcp_easy_1", title: "Google Cloud Basics", category: "GCP", difficulty: "easy", duration: 30, questions_count: 15, description: "GCP services fundamentals", status: "active" },
  { id: "gcp_medium_1", title: "GCP Compute Engine", category: "GCP", difficulty: "medium", duration: 45, questions_count: 15, description: "VMs and compute services", status: "active" },
  { id: "gcp_hard_1", title: "GCP Advanced", category: "GCP", difficulty: "hard", duration: 60, questions_count: 15, description: "GCP architecture and optimization", status: "active" },
];