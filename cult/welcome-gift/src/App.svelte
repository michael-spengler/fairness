<script lang="ts">
	let walletAddress = "";
	let socialMediaProfileLink = "";
	let visitorLevel = 0;
	async function confirmData() {
		try {
			await fetch("http://localhost:3001/api/v1/addNewcomer", {
				method: "post",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},

				//make sure to serialize your JSON body
				body: JSON.stringify({
					walletAddress,
					socialMediaProfileLink,
				}),
			});
		} catch (error) {
			alert(
				`I could not send the data to the server. Maybe the server is down. Please raise an issue on https://github.com/michael-spengler/fairness`
			);
		}
	}
	function clickNewcomer() {
		visitorLevel = 1;
	}
	function clickInsider() {
		visitorLevel = 2;
	}
</script>

<main>
	<video autoplay muted loop>
		<source
			src="https://cultdao.io/wp-content/uploads/2022/01/Stormy-Sky2.mp4"
			type="video/mp4"
		/>
	</video>

	<div id="overlay">
		<h1>CultDAO Ecosystem</h1>
		<h1>Welcome Present</h1>
		<p>
			Some of us are pretty lucky as we could explore the distributed
			ledger space from early on.
		</p>
		<p>
			So some of us have strong wallets containing many valuable Cult
			Tokens.
		</p>
		<p>
			Some of us want to give newcomers the chance to get familiar with
			<a href="https://metamask.io" target="_blank">metamask.io</a> and are
			ready to donate some Cult to those newcomers.
		</p>

		<p><br /></p>

		<button on:click={() => clickNewcomer()}> I'm a newcomer </button>
		<button on:click={() => clickInsider()}> I'm an insider </button>
		<br />

		{#if visitorLevel == 1}
			<br />
			Feel free to ...
			<p><br /></p>

			... enter your wallet address in which you want to receive CULT
			<input bind:value={walletAddress} />

			<p><br /></p>
			... enter the link to your social media profile (e.g. your facebook profile).
			<input bind:value={socialMediaProfileLink} />

			<p><br /></p>
			... post the following statement on your social media profile "I like
			the https://cultdao.io and I am ready to receive a welcome present from
			https://peer-2-peer.eth.link"

			<p><br /></p>

			{#if walletAddress != ""}
				Your Wallet Address:
				<a href="https://etherscan.io/address/{walletAddress}">
					{walletAddress}
				</a> <br />
			{/if}

			{#if socialMediaProfileLink != ""}
				Your Social Media Profile Link: <a
					href={socialMediaProfileLink}
					target="_blank">{socialMediaProfileLink}</a
				> <br />
			{/if}

			<p><br /></p>
			{#if walletAddress != "" && socialMediaProfileLink != ""}
				<button on:click={() => confirmData()}>
					That's Correct! I'm ready to receive cult!
				</button>
			{/if}
		{/if}

		<p><br /></p>
		{#if visitorLevel === 2}
			Below you find a list of newcomers. As soon as they posted
			<p />
			"I like the https://cultdao.io and I am ready to receive a welcome present
			from https://peer-2-peer.eth.link"
			<p />
			on their profile, you might send some of them some Cult, so that they
			collect some experiences and so that we further improve the distributedness
			of our cult :)<br />
		{/if}
	</div>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		color: white;
	}

	h1 {
		color: turquoise;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	video {
		z-index: 2;
	}

	#overlay {
		position: fixed; /* Sit on top of the page content */
		width: 100%; /* Full width (cover the whole page) */
		height: 100%; /* Full height (cover the whole page) */
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(
			0,
			0,
			0,
			0.5
		); /* Black background with opacity */
		z-index: 1; /* Specify a stack order in case you're using a different order for other elements */
		cursor: pointer; /* Add a pointer on hover */
	}
</style>
