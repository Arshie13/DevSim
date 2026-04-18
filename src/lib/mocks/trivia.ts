export interface TriviaQuestion {
  id: string;
  category: 'javascript' | 'react' | 'node' | 'database' | 'docker' | 'general';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const triviaQuestions: TriviaQuestion[] = [
  {
    id: 'js-1',
    category: 'javascript',
    question: 'What does "hoisting" mean in JavaScript?',
    options: [
      'Moving variables to the top of the file',
      'Declaring variables and functions are processed before execution',
      'Deleting unused variables',
      'Optimizing code for performance'
    ],
    correctAnswer: 1,
    explanation: 'Hoisting is JavaScript\'s behavior of processing declarations before execution. Variables declared with var are partially hoisted, while let/const are hoisted but not initialized (temporal dead zone).'
  },
  {
    id: 'js-2',
    category: 'javascript',
    question: 'What is the difference between == and === in JavaScript?',
    options: [
      'They are exactly the same',
      '== compares value only, === compares value and type',
      '=== is faster than ==',
      '== only works with strings'
    ],
    correctAnswer: 1,
    explanation: '== performs type coercion (converting types before comparison), while === compares both value and type without conversion. Always prefer === for strict equality.'
  },
  {
    id: 'js-3',
    category: 'javascript',
    question: 'What is a closure in JavaScript?',
    options: [
      'A way to close browser tabs',
      'A function that has access to variables from its outer scope',
      'A method to end loops',
      'A type of error handling'
    ],
    correctAnswer: 1,
    explanation: 'A closure is a function that retains access to variables from its lexical scope even when executed outside that scope. This enables powerful patterns like data privacy and function factories.'
  },
  {
    id: 'react-1',
    category: 'react',
    question: 'What is the virtual DOM?',
    options: [
      'A physical component in your computer',
      'A lightweight copy of the real DOM that React uses for efficient updates',
      'A debugging tool for React',
      'A type of React hook'
    ],
    correctAnswer: 1,
    explanation: 'The virtual DOM is an in-memory representation of the real DOM. React compares the new virtual DOM with the previous one (reconciliation) and only updates what\'s changed in the real DOM.'
  },
  {
    id: 'react-2',
    category: 'react',
    question: 'What is the purpose of useEffect?',
    options: [
      'To create styled components',
      'To perform side effects in functional components',
      'To manage state only',
      'To define routing'
    ],
    correctAnswer: 1,
    explanation: 'useEffect lets you perform side effects like data fetching, subscriptions, or DOM manipulation in functional components. It runs after render and can be configured to run at specific times.'
  },
  {
    id: 'react-3',
    category: 'react',
    question: 'What is "lifting state up" in React?',
    options: [
      'Moving components to the top of the file',
      'Moving state to a common ancestor component so siblings can share it',
      'Deleting state from components',
      'Using useState at the root level'
    ],
    correctAnswer: 1,
    explanation: 'Lifting state up means moving shared state to the closest common parent component. This allows multiple child components to access and modify the same data.'
  },
  {
    id: 'node-1',
    category: 'node',
    question: 'What is the event loop in Node.js?',
    options: [
      'A debugging tool',
      'A mechanism that handles asynchronous operations by managing callbacks',
      'A type of loop for arrays',
      'A function that runs on startup'
    ],
    correctAnswer: 1,
    explanation: 'The event loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It continuously checks the call queue and executes callbacks.'
  },
  {
    id: 'node-2',
    category: 'node',
    question: 'What is Express.js?',
    options: [
      'A database management system',
      'A fast, minimalist web framework for Node.js',
      'A CSS library',
      'A testing framework'
    ],
    correctAnswer: 1,
    explanation: 'Express.js is a minimal and flexible Node.js web application framework that provides robust features for web and mobile applications, including routing and middleware.'
  },
  {
    id: 'node-3',
    category: 'node',
    question: 'What is middleware in Express?',
    options: [
      'A database connector',
      'Functions that execute during the request-response cycle',
      'A type of API endpoint',
      'A template engine'
    ],
    correctAnswer: 1,
    explanation: 'Middleware functions have access to the request object, response object, and the next middleware function. They can execute code, modify requests/responses, or end the cycle.'
  },
  {
    id: 'db-1',
    category: 'database',
    question: 'What does ACID stand for in databases?',
    options: [
      'Advanced Computer Interface Design',
      'Atomicity, Consistency, Isolation, Durability',
      'Automatic Code Integration Database',
      'Array Container for Indexed Data'
    ],
    correctAnswer: 1,
    explanation: 'ACID is a set of properties guaranteeing reliable database transactions: Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent transactions), and Durability (committed data persists).'
  },
  {
    id: 'db-2',
    category: 'database',
    question: 'What is the difference between SQL and NoSQL databases?',
    options: [
      'SQL is faster than NoSQL',
      'SQL uses structured tables with schemas; NoSQL uses flexible document/key-value/graph formats',
      'NoSQL doesn\'t support relationships',
      'SQL is only for small databases'
    ],
    correctAnswer: 1,
    explanation: 'SQL databases use structured tables with predefined schemas and SQL for queries. NoSQL databases offer flexible schemas, better horizontal scaling, and are better for unstructured data.'
  },
  {
    id: 'db-3',
    category: 'database',
    question: 'What is an ORM?',
    options: [
      'Object-Relational Mapping - a technique to interact with databases using object-oriented code',
      'Online Resource Manager',
      'Object Render Mode',
      'Operational Replication Method'
    ],
    correctAnswer: 0,
    explanation: 'ORM (Object-Relational Mapping) allows developers to interact with databases using object-oriented code instead of raw SQL. Examples: Prisma, TypeORM, Sequelize.'
  },
  {
    id: 'docker-1',
    category: 'docker',
    question: 'What is a Docker container?',
    options: [
      'A physical shipping container',
      'A lightweight, standalone executable package that includes everything needed to run software',
      'A type of database',
      'A network protocol'
    ],
    correctAnswer: 1,
    explanation: 'A Docker container is a lightweight, standalone executable package that includes the code, runtime, libraries, and settings needed to run software consistently across environments.'
  },
  {
    id: 'docker-2',
    category: 'docker',
    question: 'What is a Dockerfile?',
    options: [
      'A file to store database credentials',
      'A text document containing instructions to build a Docker image',
      'A configuration for Docker Compose only',
      'A log file for Docker'
    ],
    correctAnswer: 1,
    explanation: 'A Dockerfile is a text document containing step-by-step instructions to build a Docker image. It specifies the base image, dependencies, commands, and configuration.'
  },
  {
    id: 'docker-3',
    category: 'docker',
    question: 'What is the difference between Docker image and container?',
    options: [
      'They are the same thing',
      'An image is a template; a container is a running instance of that image',
      'Containers are older than images',
      'Images can\'t be shared'
    ],
    correctAnswer: 1,
    explanation: 'A Docker image is a read-only template (like a blueprint), while a container is a running instance of that image. Multiple containers can run from the same image.'
  },
  {
    id: 'gen-1',
    category: 'general',
    question: 'What does API stand for?',
    options: [
      'Advanced Programming Interface',
      'Application Programming Interface',
      'Automated Program Integration',
      'Application Process Integration'
    ],
    correctAnswer: 1,
    explanation: 'API (Application Programming Interface) is a set of protocols and tools that allow different software applications to communicate with each other.'
  },
  {
    id: 'gen-2',
    category: 'general',
    question: 'What is REST?',
    options: [
      'A database type',
      'An architectural style for designing networked applications using HTTP methods',
      'A JavaScript framework',
      'A testing methodology'
    ],
    correctAnswer: 1,
    explanation: 'REST (Representational State Transfer) is an architectural style that uses HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources identified by URLs.'
  },
  {
    id: 'gen-3',
    category: 'general',
    question: 'What is Git?',
    options: [
      'A programming language',
      'A distributed version control system for tracking code changes',
      'A cloud hosting platform',
      'A database management system'
    ],
    correctAnswer: 1,
    explanation: 'Git is a distributed version control system that tracks changes in source code during development. It enables collaboration, branching, and merging of code.'
  },
  {
    id: 'gen-4',
    category: 'general',
    question: 'What is the purpose of a package manager like npm or yarn?',
    options: [
      'To write code faster',
      'To manage project dependencies and packages',
      'To deploy applications',
      'To create databases'
    ],
    correctAnswer: 1,
    explanation: 'Package managers like npm and yarn manage project dependencies, handle versioning, install packages from registries, and automate scripts in package.json.'
  },
  {
    id: 'gen-5',
    category: 'general',
    question: 'What is TypeScript?',
    options: [
      'A completely different language from JavaScript',
      'JavaScript with static type checking added',
      'A database query language',
      'A CSS preprocessor'
    ],
    correctAnswer: 1,
    explanation: 'TypeScript is JavaScript with optional static typing. It provides compile-time type checking, better tooling (autocomplete, refactoring), and catches errors before runtime.'
  }
];

export function getRandomTrivia(category?: TriviaQuestion['category']): TriviaQuestion {
  const filtered = category 
    ? triviaQuestions.filter(q => q.category === category)
    : triviaQuestions;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}

export function getTriviaByCategory(): Record<TriviaQuestion['category'], TriviaQuestion[]> {
  return triviaQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<TriviaQuestion['category'], TriviaQuestion[]>);
}