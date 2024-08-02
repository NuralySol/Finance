# Finance tracking and expense app (CRUD)
The app will track expenses and balance using graphs to visualize 
for easier and more concise customer experience. Using data vis. tools 
as well as the numerical values.

## User Story
* As a user I want my app to responsive
* As a user I want to able to track my expenses and balance with ease
* As a user I want to be able to see graphs for easier visualization
* As a user I want to be able to log-in and log-out and know that my info is secure.

## Plaid API
>Use the API [Plaid.com](https://plaid.com/) first 100 accounts is free, it has official node.js client library, expense tracking, net worth tracking, and documentation. I will use my alternate BOA bank account to show how to integrate plaid API to tracking my expenses.

## Database (MongoDB)
> A good place to place to store the data of customers.

### CRUD

>GET/POST/PUT/DELETE Expense API

>GET/POST/PUT/DELETE Balance API

* Use their official node client Plaid-Node
* Use MongooseJS for communicating with MongoDB.
* Create at least two tables: transactions and balances.
* Design your background job to periodically request financial data from Plaid and store them in your database. 
* Implement authentication and authorization

### Wireframe
The look and design of the app should be similar to that. 

> Login-page

![The wireframe on login page](./Login%20page.jpg)
> Home-page

![The wireframe on home page](./Main%20landing%20page.jpg)

### ERD 
The basic ERD for tracking expenses in a finance app.
![ERD](./Entity%20Relationship%20Diagram%20-%20Frame%201.jpg)

### Data VIS tool

> [Tableu](https://www.tableau.com) this will be my data vis tool to help me visualize the graph for my app. 

### Routes

Sure! A routing table for an ERD like the one provided involves defining the routes for each entity in a RESTful API. Each route corresponds to CRUD (Create, Read, Update, Delete) operations that can be performed on the entities. Here is an example routing table for the finance tracking app ERD:

### Routing Table

| HTTP Method | Route                    | Description                                             |
|-------------|--------------------------|---------------------------------------------------------|
| GET         | /users                   | Retrieve a list of all users                            |
| POST        | /users                   | Create a new user                                       |
| GET         | /users/{user_id}         | Retrieve a specific user by ID                          |
| PUT         | /users/{user_id}         | Update a specific user by ID                            |
| DELETE      | /users/{user_id}         | Delete a specific user by ID                            |
| GET         | /users/{user_id}/accounts| Retrieve all accounts for a specific user               |
| POST        | /accounts                | Create a new account                                    |
| GET         | /accounts/{account_id}   | Retrieve a specific account by ID                       |
| PUT         | /accounts/{account_id}   | Update a specific account by ID                         |

# Timeline: August 6 - August 12
#### COMMIT OFTEN and PUSH OFTEN TO REPO

## August 3 (Saturday)
- Get the Plaid API working with my alt. Bank account.
- Read the docs of Tableau and Plaid in depth.
- Tinker with the Tableau and create all the folder structure.

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

### Stretch Goals
Type of account access for more functionality.

>Role-based access control (RBAC) or Binary Access Control(Boolean)

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