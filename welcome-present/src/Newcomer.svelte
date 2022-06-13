<script>
    export let walletAddress;
    export let socialMediaProfileLink;
    export let backendBaseURL;
    let textarea;

    import { ethers } from "ethers";

    function clickTextarea() {
        alert("successfully copied text to your clipboard");
        textarea.select();
        document.execCommand("copy");
    }

    function isEthereumAddress(address) {
        return ethers.utils.isAddress(address);
    }

    function isProperFacebookLink(link) {
        if (
            link.indexOf("https://www.facebook.com/") !== 0 &&
            link.indexOf("https://facebook.com/") !== 0 &&
            link.indexOf("https://m.facebook.com/") !== 0
        ) {
            return false;
        }
        return true;
    }

    async function confirmData() {
        try {
            if (isEthereumAddress(walletAddress) === false) {
                alert("It seems you did not enter a correct Ethereum address.");
            } else if (isProperFacebookLink(socialMediaProfileLink) === false) {
                alert(
                    "It seems you did not enter a correct Facebook Profile Link."
                );
            } else {
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
            }
        } catch (error) {
            alert(
                `${error.message}. Please raise an issue on https://github.com/michael-spengler/fairness`
            );
        }
    }
</script>

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
<p />
<div on:click={() => clickTextarea()}>
    <textarea name="" id="" cols="30" rows="3" readonly bind:this={textarea}>I like the https://cultdao.io. I'm ready to receive a welcome present from https://peer-2-peer.eth.limo.</textarea>
</div>

<p />
{#if walletAddress != "" && socialMediaProfileLink != ""}
    <button on:click={() => confirmData()}> Save & Get Lucky </button>
{/if}

<style>
    input {
        width: 55%;
    }

    @media only screen and (max-width: 700px) {
        input {
            width: 95%;
        }   
    }
    textarea {
        background-color: grey !important;
    }
</style>
