<script>
    import { onMount } from "svelte";
    import Insider from "./Insider.svelte";
    import Newcomer from "./Newcomer.svelte";

    // let backendBaseURL = "http://localhost:3001";
    const backendBaseURL = "https://sport-kamasutra.org:9443";

    let newcomers = [];
    let walletAddress = "";
    let socialMediaProfileLink = "";
    let visitorLevel = 0;

    function clickNewcomer() {
        visitorLevel = 1;
    }
    function clickInsider() {
        visitorLevel = 2;
    }

    onMount(async () => {
        const response = await fetch(`${backendBaseURL}/api/v1/getNewcomers`);
        newcomers = await response.json();
    });
</script>

<video autoplay muted loop id="myVideo">
    <source
        src="https://cultdao.io/wp-content/uploads/2022/01/Stormy-Sky2.mp4"
        type="video/mp4"
    />
</video>

<!-- <audio controls autoplay>
    <source src="./summary.mp3" type="audio/mpeg" />
    Your browser does not support the audio element.
</audio> -->

<div class="content">
    <div
        on:click={() => {
            location.reload(true);
        }}
    >
        <h1>CultDAO Ecosystem</h1>
        <h2>Welcome Present</h2>
    </div>

    {#if visitorLevel === 0}
        <p>
            Some of us are pretty lucky as we could explore the distributed
            ledger space from early on.
        </p>
        <p>
            Some of <a
                href="https://github.com/michael-spengler/fairness"
                target="_blank">us</a
            >
            want to give newcomers the chance to get familiar with
            <a href="https://metamask.io" target="_blank">metamask.io</a> and
            are ready to donate some
            <a href="https://cultdao.io" target="_blank">cultdao.io</a> tokens to
            those newcomers.
        </p>
        <p><br /></p>

        <button on:click={() => clickNewcomer()}> I'm a newcomer </button>
        <button on:click={() => clickInsider()}> I'm an insider </button>
    {/if}

    {#if visitorLevel == 1}
        <Newcomer {walletAddress} {socialMediaProfileLink} {backendBaseURL} />
    {/if}

    {#if visitorLevel === 2}
        <Insider {newcomers} />
    {/if}
</div>

<style>
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

    @media only screen and (max-height: 700px) {
        h1 {
            font-size: 2.7em;
            margin-top: 7vh;
        }
        h2 {
            font-size: 1.8em;
        }
    }
</style>
