import { opine, json } from "https://deno.land/x/opine@2.2.0/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";

const app = opine();
app.use(opineCors())
app.use(json());

const port = Number(Deno.args[0])

const pathToNewcomers = `${Deno.cwd()}/newcomers.json`

app.get("/api/v1/getNewcomers", function (req, res) { // http://localhost:3001/api/v1/getNewcomers
    const newcomers = JSON.parse(Deno.readTextFileSync(pathToNewcomers))
    res.send(newcomers);
});

app.post("/api/v1/addNewcomer", function (req, res) {

    const newcomers = JSON.parse(Deno.readTextFileSync(pathToNewcomers))

    if (newcomers.filter((e: any) => e.walletAddress === req.body.walletAddress)[0] !== undefined) {
        res.send("for this wallet address there is already an entry made.");
    } else if (newcomers.filter((e: any) => e.socialMediaProfileLink === req.body.socialMediaProfileLink)[0] !== undefined) {
        res.send("for this social media profile link there is already an entry made.");
    } else {
        newcomers.push(req.body)
        Deno.writeTextFileSync(pathToNewcomers, JSON.stringify(newcomers))
        console.log(req.body)
        res.send("mission accomplished");
    }

});

app.listen(
    port,
    () => console.log(`server is listening on http://localhost:${port} 🚀`),
);


