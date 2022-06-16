<script>
    import { ethers } from "ethers";

    export let account = "";
    export let provider;
    
    async function connectToBrowserWallet() {
        if (typeof window.ethereum === "undefined") {
            alert("You need to install a browserwallet like metamask.io.");
        } else {
            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            account = accounts[0];
            provider = new ethers.providers.Web3Provider(
                window.ethereum,
                "any"
            );

        }
    }
</script>

<div >
    {#if account !== ""}
        You are logged in via the following browserwallet: <p />
       <h4 class="account"> {account}</h4> <p>on chainID {provider.provider.chainId}.</p>
    {:else}
        <button on:click={connectToBrowserWallet} class="btn btn--primary">Connect Browserwallet</button>
    {/if}
</div>

<style>
    .account {
       margin-top: 0;
    }
</style>