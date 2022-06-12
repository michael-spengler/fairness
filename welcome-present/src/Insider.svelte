<script>
    export let newcomers;

    let randomNewcomer = undefined;
    function pickNewcomer() {
        const randomIndex = Math.round(
            Math.random() * (newcomers.length - 1 - 0) + 0
        );
        randomNewcomer = newcomers[randomIndex];
    }
</script>

<p><br /></p>
You might send some of our newcomers some CULT if they talk about the cultdao publicly
on facebook, so that they collect some experiences and so that
<a href="https://github.com/michael-spengler/fairness" target="_blank">we</a>
further improve the distributedness of our cult :)
<p><br /></p>
{#if newcomers.length > 0}
    {#if newcomers.length > 1}
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
        <a href="https://etherscan.io/address/{randomNewcomer.walletAddress}">
            {randomNewcomer.walletAddress}
        </a>
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

<style>
    a {
        color: red;
    }
</style>
