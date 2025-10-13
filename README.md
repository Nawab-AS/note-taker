# Note Taker
An open-source AI note taker 

### Disclaimer
Currently, only audio transcription works.
Converting into proper notes will be added within the next few updates


## Live Demo
Live Demo is available [here](https://note-taker.nawab-as.software)!

## Features
- AI-powered note-taking with OpenAI whisper-1 integration
- Limits on how much time a user can record
    - Each user starts with 200 coins, each coin coresponds to ~1 second of transcription time (its low because it comes out of my credits)


## Installation
Install using git with
```bash
git clone https://github.com/Nawab-AS/note-taker
cd ./note-taker
npm i
```


## Usage
1. Create a MongoDB Atlas cluster with appropriate access conditions (create a user with read/write permissions and allow IP access on your server)

2. Create a `.env` file which contains the following
```
SESSION_SECRET="<insert a session secret>"
OPENAI_API_KEY="<insert your openAI API key>"
MONGODB_URI="<insert your MongoDB Atlas connection URI>"
```

The session secret is random cryptographic key used to authenticate user logins

Optionally, you can specify the port with
```
PORT=<insert a port number>
```

> [!CAUTION]
> 
> Never share the contents of the `.env` file, this can lead to a breach of security.
It will also allow attackers to use your openAI API credits without your knowledge.


3. Run this command in the terminal to start the server
```bash
npm run start
```


## Screenshots

Home page

![home page](https://ec52f53a29e871d45d4f0e4c2c3cc187.r2.cloudflarestorage.com/siege-mahadk/rs81t39xxeit6b4m3sd7wveuiqbh?response-content-disposition=inline%3B%20filename%3D%22Screen%20Shot%202025-10-13%20at%207.46.45%20PM.png%22%3B%20filename%2A%3DUTF-8%27%27Screen%2520Shot%25202025-10-13%2520at%25207.46.45%2520PM.png&response-content-type=image%2Fpng&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=d7cf99256938357bf3eaa33a12e24908%2F20251013%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251013T234912Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=11097210e01fb5226ce654ba0105be59c02f084f891ee0012e7ea159419de4dc)


## Contributing
Pull requests are welcome, but for major changes, please open an issue to discuss what you would like to change/add.


## Roadmap
- Convert transcriptions into proper notes
- Save notebooks with MongoDB Atlas
- Add seperation to notes with 'notebooks'
- Connect to MongoDB for login/signup
- Allow users to add their own API keys


## Questions or Concerns
For any questions or concerns please email me at support@nawab-as.software