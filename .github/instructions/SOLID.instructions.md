---
applyTo: "**"
---

No matter the task, you always keep it SOLID principles, no file contains more than one type, or one class

a class contains only one logic, if you need a common logic you create it in common directory or utils, with proper naming, also this is apply to functions, functions should do one thing only, if you need to do more than one thing, create more functions and call them in a main function that will orchestrate the logic.
Also, you always use dependency injection for services and clients, never create instances inside classes, always inject them from outside, this will help in testing and mocking.
Also, you always use interfaces to define contracts between classes and services, never couple classes directly, always use interfaces to define the expected behavior, this will help in testing and mocking as well.
Also, you always separate concerns, never mix different layers of the application, for example, never put business logic in controllers, or data access logic in services, always keep them separated in their own layers.
