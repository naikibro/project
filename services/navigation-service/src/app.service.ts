import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getLandingPage(): string {
    const projectName = process.env.PROJECT_NAME;
    return `
      <!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName ?? 'backend'}</title>
    <link rel="icon" type="image/png" href="/favicon.ico" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333;
        margin: 0;
        padding: 20px;
        text-align: center;
      }
      .container {
        max-width: 800px;
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        margin: auto;
      }
      h1 {
        color: #0073e6;
      }
      img {
        max-width: 200px;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
      }
      th {
        background-color: #0073e6;
        color: white;
      }
      a {
        color: #0073e6;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img src="/logo-full-white.png" alt="Logo" onerror="this.style.display='none';">
      
      <h2>Project Documentation</h2>
      <p>
        API documentation is available at:
        <a href="/api">/api</a>
      </p>
    </div>
  </body>
</html>
    `;
  }
}
