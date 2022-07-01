<script>
    import { onMount } from "svelte";

    export let newcomers;
    export let newHolders;

    let randomNewcomer = undefined;

    function pickNewcomer() {
        const randomIndex = Math.round(
            Math.random() * (newcomers.length - 1 - 0) + 0
        );
        randomNewcomer = newcomers[randomIndex];
    }

    onMount(async () => {
        pickNewcomer();
    });
</script>

<p><br /></p>
You might send some CULT to some of our newcomers, if they talk about the cultdao
publicly on facebook, so that they collect some experiences and so that
<a href="https://github.com/michael-spengler/fairness" target="_blank">we</a>
further improve the distributedness of our cult :)
<p><br /></p>
{#if newcomers.length > 0}
    {#if newcomers.length === 1}
        There is {newcomers.length} newcomer in the queue.
    {/if}

    {#if newcomers.length > 1}
        There are {newcomers.length} newcomers in the queue.
        <button
            on:click={() => {
                pickNewcomer();
            }}
        >
            Show a Random Newcomer
        </button>
    {/if}

    {#if randomNewcomer !== undefined}
        <p />
        <a
            href="https://etherscan.io/address/{randomNewcomer.walletAddress}#tokentxns"
        >
            {randomNewcomer.walletAddress}
        </a>
        <!-- <a href="https://etherscan.io/address/{randomNewcomer.walletAddress}">
            {randomNewcomer.walletAddress}
        </a> -->
        <p />
        <a href={randomNewcomer.socialMediaProfileLink} target="_blank"
            >{randomNewcomer.socialMediaProfileLink}</a
        >
    {/if}
{/if}

{#if newcomers.length === 0}
    All registered newcomers already received their welcome present. We need to
    wait for further newcomers to register themselves.
{/if}

<p />

{#if newHolders.length > 0}
    Recent welcome presents went to: <p />

    {#each newHolders as newHolder}
        <br />
        <a href={newHolder.socialMediaProfileLink} target="_blank"
            >{newHolder.socialMediaProfileLink}</a
        >
        <br />

        (<a
            href="https://etherscan.io/address/{newHolder.walletAddress}#tokentxns"
        >
            {newHolder.walletAddress}
        </a>)
    {/each}
{/if}

<style>
    a {
        color: red;
    }
</style>
