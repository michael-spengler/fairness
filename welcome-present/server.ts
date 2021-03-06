import { opine, json } from "https://deno.land/x/opine@2.2.0/mod.ts";
import { opineCors } from "https://deno.land/x/cors/mod.ts";
import { config as dotEnvConfig } from 'https://deno.land/x/dotenv@v1.0.1/mod.ts'

dotEnvConfig({ export: true });

const app = opine();
app.use(opineCors())
app.use(json());

// app.use(serveStatic("public", { dotfiles: 'allow' }))

const port = Number(Deno.args[0])

const pathToNewcomers = `${Deno.cwd()}/newcomers.json`
const pathToNewHolders = `${Deno.cwd()}/new-holders.json`
const pathToRVLTNewcomers = `${Deno.cwd()}/../welcome-present-rvlt/rvlt-newcomers.json`
const pathToNewRVLTHolders = `${Deno.cwd()}/../welcome-present-rvlt/new-rvlt-holders.json`


const validateWriteAccessKey = function (req: any, res: any, next: any) {

    const correctWriteAccessKey = Deno.env.get("WRITE_ACCESS_KEY");

    if (correctWriteAccessKey === req.query.writeaccesskey) {
        next()
    } else {
        res.send(`you forgot to provide the correct write access key`)
    }

}


// http://localhost:3001/api/v1/getNewcomers // http://65.21.110.40:3002/api/v1/getNewcomers
app.get("/api/v1/getNewcomers", function (req, res) {
    const newcomers = JSON.parse(Deno.readTextFileSync(pathToNewcomers))
    res.send(newcomers);
});

// http://localhost:3001/api/v1/getNewHolders // http://65.21.110.40:3002/api/v1/getNewHolders
app.get("/api/v1/getNewHolders", function (req, res) {
    const newHolders = JSON.parse(Deno.readTextFileSync(pathToNewHolders))
    res.send(newHolders);
});

// http://localhost:3001/api/v1/getNewcomers // http://65.21.110.40:3002/api/v1/getNewcomers
app.get("/api/v1/getRVLTNewcomers", function (req, res) {
    const newcomers = JSON.parse(Deno.readTextFileSync(pathToRVLTNewcomers))
    res.send(newcomers);
});

// http://localhost:3001/api/v1/getNewHolders // http://65.21.110.40:3002/api/v1/getNewHolders
app.get("/api/v1/getNewRVLTHolders", function (req, res) {
    const newHolders = JSON.parse(Deno.readTextFileSync(pathToNewRVLTHolders))
    res.send(newHolders);
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

app.post("/api/v1/addRVLTNewcomer", function (req, res) {

    const newcomers = JSON.parse(Deno.readTextFileSync(pathToRVLTNewcomers))

    if (newcomers.filter((e: any) => e.walletAddress === req.body.walletAddress)[0] !== undefined) {
        res.send({ status: "for this wallet address there is already an entry made." });
    } else if (newcomers.filter((e: any) => e.socialMediaProfileLink === req.body.socialMediaProfileLink)[0] !== undefined) {
        res.send({ status: "for this social media profile link there is already an entry made." });
    } else {
        
        newcomers.push(req.body)
        Deno.writeTextFileSync(pathToRVLTNewcomers, JSON.stringify(newcomers))
        console.log(req.body)
        res.send({ status: "mission accomplished" });
    }

});


app.post("/api/v1/upgradeCULTNewcomerToHolder", validateWriteAccessKey, function (req: any, res: any) {

    const newcomers = JSON.parse(Deno.readTextFileSync(pathToNewcomers))
    const holders = JSON.parse(Deno.readTextFileSync(pathToNewHolders))

    const entry = newcomers.filter((e: any) => e.walletAddress === req.body.walletAddress && e.socialMediaProfileLink === req.body.socialMediaProfileLink)[0]
    if (entry === undefined) {
        throw new Error(`no entry in newcomers file found for ${req.body.walletAddress} ${req.body.socialMediaProfileLink}`)
    } else {
        newcomers.splice(newcomers.indexOf(entry), 1)
        holders.push(entry)
    }

    Deno.writeTextFileSync(pathToNewcomers, JSON.stringify(newcomers))
    Deno.writeTextFileSync(pathToNewHolders, JSON.stringify(holders))


});

app.post("/api/v1/upgradeRVLTNewcomerToHolder", validateWriteAccessKey, function (req: any, res: any) {

    const newcomers = JSON.parse(Deno.readTextFileSync(pathToRVLTNewcomers))
    const holders = JSON.parse(Deno.readTextFileSync(pathToNewRVLTHolders))

    const entry = newcomers.filter((e: any) => e.walletAddress === req.body.walletAddress && e.socialMediaProfileLink === req.body.socialMediaProfileLink)[0]
    if (entry === undefined) {
        throw new Error(`no entry in newcomers file found for ${req.body.walletAddress} ${req.body.socialMediaProfileLink}`)
    } else {
        newcomers.splice(newcomers.indexOf(entry), 1)
        holders.push(entry)
    }
    Deno.writeTextFileSync(pathToRVLTNewcomers, JSON.stringify(newcomers))
    Deno.writeTextFileSync(pathToNewRVLTHolders, JSON.stringify(holders))


});

if (port === 9443) {

    const pathToCertFile = `/etc/letsencrypt/live/sport-kamasutra.org/fullchain.pem`
    const pathToKeyFile = `/etc/letsencrypt/live/sport-kamasutra.org/privkey.pem`

    app.listen({ port, certFile: pathToCertFile, keyFile: pathToKeyFile }, () => console.log(`server is listening on https://localhost:${port} ????`));

} else {
    app.listen(port, () => console.log(`server is listening on http://localhost:${port} ????`));
}


