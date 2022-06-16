<script lang="ts">
    import Connect from "./Connect.svelte";

    export let pwaName;
    let mode = 0;
    let account = "";
    let provider;

    function wantToBuyNFTs() {
        mode = 1;
    }

    function wantToSellNFTs() {
        mode = 2;
    }
</script>

<main>
    <video autoplay muted loop id="myVideo">
        <source
            src="https://cultdao.io/wp-content/uploads/2022/01/Stormy-Sky2.mp4"
            type="video/mp4"
        />
    </video>

    <div class="content">
        <h1>{pwaName}</h1>
        <h2>
            Here you can buy and sell NFTs using <a
                href="https://coinmarketcap.com/currencies/cult-dao/"
                target="_blank">CULT</a
            >
        </h2>

        <p><br /></p>

        <Connect bind:account bind:provider />
        {#if account !== ""}
            {#if mode === 0}
                <button on:click={() => wantToBuyNFTs()}>Buy NFTs</button>
                <button on:click={() => wantToSellNFTs()}>Sell NFTs</button>
            {/if}

            {#if mode === 1}
                <h3>
                    NFT Gallery
                    ... under construction ...
                </h3> 
                {/if}
                
                {#if mode === 2}
                <h3>
                    Offer Your NFTs
                    ... under construction ...
                </h3> 

            {/if}
        {/if}
    </div>
</main>

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
    h3 {
        color: turquoise;
        text-transform: uppercase;
        font-size: 2em;
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
