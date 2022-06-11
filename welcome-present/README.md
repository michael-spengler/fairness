# CultDAO Welcome Present

## For Users
Newcomers to this project might claim their [Welcome Present](https://peer-2-peer.eth.link). 

## For Developers
Contributions are welcome. To simplify contributions I describe how this project was created.  

### Frontend
The UI is created using [svelte](https://svelte.dev/docs).

```sh

npx degit sveltejs/template welcome-gift
cd welcome gift
node scripts/setupTypeScript.js # ... to use TypeScript
npm i 

```

You can work on and test the UI by executing the following statement within the welcome-gift folder.

```sh

npm run dev

```

### Backend
To save gas fees and due to the fact that the use case seems not too critical, I implemented an off-chain backend. To use state of the art off-chain technology I chose [Deno](https://deno.land).

You can start the off-chain server to listen on port 3001 via

```sh

deno run --allow-net --allow-read --allow-write server.ts 3001

```