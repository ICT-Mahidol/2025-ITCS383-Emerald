# Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ICT-Mahidol/2025-ITCS383-Emerald.git
   cd 2025-ITCS383-Emerald
   ```

2. **Install dependencies**
   ```bash
   cd implementations
   npm install
   ```
<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/a6734159-5b2b-4bcf-b2e0-0bbd6db92efe" />

3. **Configure environment variables**

   Create a `.env` file in the `implementations/` directory:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   PORT=3000
   ENCRYPTION_KEY=<64-character hex string>
   ```

   Generate an encryption key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/067ecf79-d3d9-4f91-b079-a60e70455479" />

<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/7b353972-9465-4565-9343-10a7df26a03c" />

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser** → [http://localhost:3000](http://localhost:3000)

> All database tables, indexes, seed data (50 desks, equipment inventory), and a default manager account are automatically created on first startup.

<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/dd581eeb-1604-4830-a3a6-fefaab780dee" />

### Default Manager Account

| Email              | Password   |
|--------------------|------------|
| `admin@spacehub.co`| `admin123` |

<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/236df1bc-6465-4e10-aa2d-08e14b6acb54" />

<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/e8b922bf-ea39-42a8-b256-e714f91f587a" />


# Run with Docker

```bash
cd implementations

# Build the image
docker build -t 2025-itcs383-emerald .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_neon_connection_string" \
  -e ENCRYPTION_KEY="your_64_char_hex_key" \
  2025-itcs383-emerald
```
<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/87ff448e-3f02-41d9-8c57-928385c4df1f" />

<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/4598bcac-287e-4f7d-8823-2b4eaf5b9c85" />

<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/05c84354-6cd4-4cfa-9e13-64e1f727afcd" />

<img width="2880" height="1864" alt="image" src="https://github.com/user-attachments/assets/849ee27c-d37a-4f7d-af22-109d85791510" />
