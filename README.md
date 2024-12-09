Frontend - App
  npm run dev
  npm run build
  npm run start
  
  Clerk Webhook testing locally 
  Download ngrok from the official site: https://ngrok.com/download.
  ngrok http 3000
  Signup on ngrok and copy the token. 
  Retrieve your authtoken from the dashboard.
  ngrok config add-authtoken YOUR_AUTHTOKEN
  ngrok http 3000
  ngrok tcp 22
  copy paste the ngrok url in the clerk dashboard.
  (e.g.  https://25c7-102-176-125-148.ngrok-free.app)

Backend - Ecommerce API
  npm run dev
  npm run build
  npm run start
    
