<script>
    import { onMount } from "svelte";

    const backendBaseURL = "http://localhost:3001";
    // const backendBaseURL = "http://65.21.110.40:3002";

    let newcomers = [];
    let walletAddress = "";
    let socialMediaProfileLink = "";
    let visitorLevel = 0;
    let textarea;

    async function confirmData() {
        try {
            const response = await fetch(
                `${backendBaseURL}/api/v1/addNewcomer`,
                {
                    method: "post",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        walletAddress,
                        socialMediaProfileLink,
                    }),
                }
            );

            const serverInfo = await response.json();
            alert(serverInfo.status);
        } catch (error) {
            alert(
                `${error.message}. Please raise an issue on https://github.com/michael-spengler/fairness`
            );
        }
    }
    function clickNewcomer() {
        visitorLevel = 1;
    }
    function clickInsider() {
        visitorLevel = 2;
    }

    function clickTextarea() {
        alert("successfully copied text to your clipboard")
		textarea.select();
		document.execCommand('copy');
    }

    onMount(async () => {
        const response = await fetch(`${backendBaseURL}/api/v1/getNewcomers`);
        newcomers = await response.json();
    });
</script>

<!-- The video -->
<video autoplay muted loop id="myVideo">
    <source
        src="https://cultdao.io/wp-content/uploads/2022/01/Stormy-Sky2.mp4"
        type="video/mp4"
    />
</video>

<!-- Optional: some overlay text to describe the video -->
<div class="content">
    <h1>CultDAO Ecosystem</h1>
    <h2>Welcome Present</h2>

    {#if visitorLevel === 0}
        <p>
            Some of us are pretty lucky as we could explore the distributed
            ledger space from early on.
        </p>
        <p>
            So some of us have strong wallets containing many valuable <a
                href="https://cultdao.io"
                target="_blank">cultdao.io</a
            > tokens.
        </p>
        <p>
            Some of <a
                href="https://github.com/michael-spengler/fairness"
                target="_blank">us</a
            >
            want to give newcomers the chance to get familiar with
            <a href="https://metamask.io" target="_blank">metamask.io</a> and are
            ready to donate some CULT to those newcomers.
        </p>
        <p><br /></p>

        <button on:click={() => clickNewcomer()}> I'm a newcomer </button>
        <button on:click={() => clickInsider()}> I'm an insider </button>
    {/if}

    {#if visitorLevel == 1}
        <br />
        <input
            bind:value={walletAddress}
            placeholder="Please enter your public wallet address"
        />

        <br />
        <input
            bind:value={socialMediaProfileLink}
            placeholder="Please enter your facebook profile link"
        />

        <p />
        ... post the following statement publicly on your facebook profile
        <br>
        <div on:click="{() => clickTextarea()}">
            <textarea name="" id="" cols="30" rows="3" readonly bind:this={textarea}>I like the https://cultdao.io. I'm ready to receive a welcome present from https://peer-2-peer.eth.link.</textarea>
        </div>

        <p><br /></p>
    {/if}

    {#if visitorLevel === 1 && walletAddress != "" && socialMediaProfileLink != ""}
        <button on:click={() => confirmData()}>
            That's Correct! I'm ready to receive cult!
        </button>
    {/if}

    <p><br /></p>
    {#if visitorLevel === 2 && newcomers.length > 0}
        Below you find a list of newcomers. As soon as they posted
        <p />
        "I like the https://cultdao.io and I am ready to receive a welcome present
        from https://peer-2-peer.eth.link"
        <p />
        on their profile, you might send some of them some Cult, so that they collect
        some experiences and so that we further improve the distributedness of our
        cult :)
        <p><br /></p>

        <table>
            <tr>
                <th>Wallet Address</th>
                <th>Social Media Profile Link</th>
            </tr>
            {#each newcomers as newcomer}
                <tr>
                    <td>
                        <a
                            href="https://etherscan.io/address/{newcomer.walletAddress}"
                        >
                            {newcomer.walletAddress}
                        </a></td
                    >
                    <td
                        ><a
                            href={newcomer.socialMediaProfileLink}
                            target="_blank">{newcomer.socialMediaProfileLink}</a
                        ></td
                    >
                </tr>
            {/each}
        </table>
    {/if}

    {#if visitorLevel === 2 && newcomers.length === 0}
        All registered newcomers already received their welcome present. We need
        to wait for further newcomers to register themselves.
    {/if}
</div>

<style>
    input {
        width: 95%;
    }

    textarea {
        background-color:grey !important;
    }
    a {
        color: red;
    }
    #myVideo {
        position: fixed;
        right: 0;
        bottom: 0;
        min-width: 100%;
        min-height: 100%;
    }

    .content {
        position: fixed;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        color: #f1f1f1;
        width: 100%;
        height: 100%;
        text-align: center;
        font-size: larger;
    }

    h1 {
        color: red;
        text-transform: uppercase;
        font-size: 3.6em;
        font-weight: 160;
        margin-top: 6vh;
    }
    h2 {
        color: turquoise;
        text-transform: uppercase;
        font-size: 3em;
        font-weight: 100;
    }

    table {
        margin-left: auto;
        margin-right: auto;
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 60%;
    }

    td,
    th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
    }
</style>
