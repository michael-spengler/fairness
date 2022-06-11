import { opine } from "https://deno.land/x/opine@2.2.0/mod.ts";

const app = opine();
const port = Deno.args[0]

app.get("/", function (req, res) {
    res.send("Hello World");
});


app.listen(
    port,
    () => console.log(`server has started on http://localhost:${port} 🚀`),
);