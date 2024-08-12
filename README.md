# Finance tracking and expense app (CRUD)

The app will track expenses using graphs to visualize
for easier and more concise customer experience. Using data vis. tools
as well as the numerical values to convey the message. 

## User Story

- As a user I want my app to responsive
- As a user I want to able to track my expenses and balances with ease
- As a user I want to be able to see graphs for easier visualization
- As a user I want to be able to log-in and log-out and know that my info is secure

## Plaid API

> Use the API [Plaid.com](https://plaid.com/) first 100 accounts is free, it has official node.js client library, expense tracking, net worth tracking, and documentation. I will use my alternate BOA bank account to show how to integrate plaid API to tracking my expenses. After many deliberations I have decided to use their sandbox mode because it is more secure and I am not yet comfortable with sharing my financial history with plaid yet.

## Database (MongoDB)

> A good place to place to store the data of customers. Local and cluster setup.

### CRUD

> GET/POST/PUT/DELETE Expense API

> GET/POST/PUT/DELETE Balance API *** this is a stretch goal ***

- Use their official node client Plaid-Node
- Use MongooseJS for communicating with MongoDB.
- Create at least two tables: transactions, dates, pie, chart and bar chart, etc. 
- Design your background job to periodically request financial data from Plaid and store them in your database.
- Implement authentication and authorization

### Wireframe

The look and design of the app should be similar to that.

> Login-page

![The wireframe on login page](./public/Login%20page.jpg)

> Home-page

![The wireframe on home page](./public/Main%20landing%20page.jpg)

### ERD

The basic ERD for tracking expenses in a finance app.
![ERD](./public/Entity%20Relationship%20Diagram%20-%20Frame%201.jpg)

### Future Plans

The stretch goal vis cue for the future of the app.
![Future Wireframe](./public/Stretch%20Goal.jpg)

### Data VIS tool

> [Plotly](https://plotly.com/javascript) this will be my data vis tool to help me visualize the graph for my app.

### Routes

Sure! A routing table for an ERD like the one provided involves defining the routes for each entity in a RESTful API. Each route corresponds to CRUD (Create, Read, Update, Delete) operations that can be performed on the entities. Here is an example routing table for the finance tracking app ERD:

### Routing Table

| **HTTP Method** | **Route**               | **Description**                                                                 |
|-----------------|-------------------------|---------------------------------------------------------------------------------|
| **GET**         | `/`                     | Redirects to the login page.                                                    |
| **GET**         | `/register`             | Renders the user registration page.                                             |
| **POST**        | `/register`             | Handles user registration and redirects to the login page upon success.         |
| **GET**         | `/login`                | Renders the login page.                                                         |
| **POST**        | `/login`                | Processes user login, verifies credentials, and redirects to account linking.   |
| **POST**        | `/logout`               | Logs out the user, destroys the session, and clears the session cookie.         |
| **GET**         | `/link-account`         | Renders the account linking page (requires user to be logged in).               |
| **POST**        | `/create-link-token`    | Creates a Plaid link token for account linking (requires user to be logged in). |
| **POST**        | `/get-transactions`     | Fetches transactions from Plaid, saves them to MongoDB, and returns a response. |
| **GET**         | `/dashboard`            | Displays the user's transactions in a dashboard view (requires user login).     |
| **DELETE**      | `/delete-user`          | Deletes the user's account and session, sending a confirmation response.        |
# Timeline: August 6 - August 12

#### COMMIT OFTEN and PUSH OFTEN TO REPO

## August 3 (Saturday)

- Get the Plaid API working with my alt. Bank account.
- Read the docs of PLotly and Plaid in depth.
- Tinker with the Plotly and create all the folder structure.

## August 4 (Sunday)

- Create the folder structure of the project.
- Create the boiler plates and starter code (some pseudocode)
- Code as much as possible.

## August 5 (Monday)

- Create a working prototype just link, routes, and databes
- bug and debugg to make sure the routes and the logic works

## August 6 (Tuesday)

- Work more and tune in the app.
- Get some feedback on the working prototype.
- Code as much as possible.

## August 7 (Wednesday)

- Buy a domain?
- If domain bought test with it.

## August 8 (Thursday)

- Create a product description so that customer knows the app.

## August 9 (Friday)

- Make sure the full stack is working by this time MVP.
- Get feedback

## August 10 (Saturday)

- Bug fixes and testing
- Code more if there bug fixes and if finished do stretch goals.

## August 11 (Sunday)

- Test a alot

## August 12 (Monday)

- Presentation time

## Technologies used.
- Plaid API (sandbox mode for security reasons)
- Plotly api script for data vis
- Mango DB 
- EJS
- HTML, JS, CSS
- JSON with all the modules listed

### Stretch Goals

- Type of account access for more functionality.
- More data type visalizations to compare and contrast the month to month spending (**Plotly**)
- Budgeting

> Role-based access control (RBAC) or Binary Access Control(Boolean)

Binary access control (Boolean)

```Javascript
const users = [
  {
    userId: 1,
    username: 'authorized_user',
    isAuthorized: true
  },
  {
    userId: 2,
    username: 'unauthorized_user',
    isAuthorized: false
  }
];
```

RBAC code example:

```Javascript
const users = [
  {
    userId: 1,
    username: 'admin_user',
    roles: ['Admin']
  },
  {
    userId: 2,
    username: 'regular_user',
    roles: ['User']
  }
];
```
