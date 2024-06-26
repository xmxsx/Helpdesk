# Helpdesk Application

Welcome to the Helpdesk application, a tool for managing support tickets and providing technical assistance. This guide will help you set up and run both the frontend (Nuxt.js) and backend (Node.js with MongoDB) on your local machine.

## Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)

### Cloning the Repository

1. **Clone the repository:**

   git clone https://github.com/xmxsx/Helpdesk.git
   cd helpdesk

2. **Navigate to the backend directory:**

cd helpdesk-api
npm install

3. **Set up environment variables for the backend:**

MONGO_URI=mongodb://127.0.0.1:27017/helpdesk
JWT_SECRET=95c0974d8a7c50028dfe525eab3b8b9a7db8ed923d18648d198bad18800392163859aa9bad82d566fe0ed75841f65007f72ac0761ff479b77fc73d56fd14ab41


4. **Run the backend server:**

npm start

5. **Navigate to the frontend directory:**

cd ../helpdesk-nuxt

6. **Install frontend dependencies:**

npm install

7. **Run the development server:**

npm run dev

#### Screenshots

![login](https://github.com/xmxsx/Helpdesk/assets/159201856/9889f80c-544c-4b97-8a69-cf5bab3b7ca0)

![register](https://github.com/xmxsx/Helpdesk/assets/159201856/ecda42b8-4c89-45be-85b9-8b10e1614388)

![dashboard](https://github.com/xmxsx/Helpdesk/assets/159201856/0d4d5d80-22db-434f-9180-375d78fec274)

![dashboard2](https://github.com/xmxsx/Helpdesk/assets/159201856/97d975ae-7868-44ce-9a93-c65dc7d4520b)

![users](https://github.com/xmxsx/Helpdesk/assets/159201856/06157b57-211b-4f45-9cfd-ea4dfee8aa87)

![addticket](https://github.com/xmxsx/Helpdesk/assets/159201856/6c7da186-9b10-4228-bb53-5f2ac0135344)

![settings](https://github.com/xmxsx/Helpdesk/assets/159201856/06fa1ac2-2bbc-4bbc-9385-3756c13f086a)

