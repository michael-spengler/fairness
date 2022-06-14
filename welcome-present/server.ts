import { opine, json, serveStatic } from "https://deno.land/x/opine@2.2.0/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";

const app = opine();
app.use(opineCors())
app.use(json());
// app.use(serveStatic("public", { dotfiles: 'allow' }))

const port = Number(Deno.args[0])

const pathToNewcomers = `${Deno.cwd()}/newcomers.json`

// http://localhost:3001/api/v1/getNewcomers // http://65.21.110.40:3002/api/v1/getNewcomers
app.get("/api/v1/getNewcomers", function (req, res) {
    const newcomers = JSON.parse(Deno.readTextFileSync(pathToNewcomers))
    res.send(newcomers);
});

app.post("/api/v1/addNewcomer", function (req, res) {

    const newcomers = JSON.parse(Deno.readTextFileSync(pathToNewcomers))

    if (newcomers.filter((e: any) => e.walletAddress === req.body.walletAddress)[0] !== undefined) {
        res.send({ status: "for this wallet address there is already an entry made." });
    } else if (newcomers.filter((e: any) => e.socialMediaProfileLink === req.body.socialMediaProfileLink)[0] !== undefined) {
        res.send({ status: "for this social media profile link there is already an entry made." });
    } else {
        newcomers.push(req.body)
        Deno.writeTextFileSync(pathToNewcomers, JSON.stringify(newcomers))
        console.log(req.body)
        res.send({ status: "mission accomplished" });
    }

});

if (port === 9443) {
    const pathToCertFile = `/etc/letsencrypt/live/sport-kamasutra.org/fullchain.pem`
    const pathToKeyFile = `/etc/letsencrypt/live/sport-kamasutra.org/privkey.pem`

    app.listen({ port, certFile: pathToCertFile, keyFile: pathToKeyFile });

} else {
    app.listen(port, () => console.log(`server is listening on http://localhost:${port} 🚀`));    
}


