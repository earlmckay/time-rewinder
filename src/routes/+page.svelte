<script>
	import { onMount } from 'svelte';

	let importedFiles = [];

	function handleDrop(event) {
		event.preventDefault();
		const files = Array.from(event.dataTransfer.files);
		importedFiles = files.filter(
			(file) => file.type.startsWith('image/') || file.type.startsWith('video/'),
		);
		copyCommands();
	}

	function formatFilename(name) {
		const year = name.slice(0, 4);
		const month = name.slice(4, 6);
		const day = name.slice(6, 8);
		const hour = name.slice(9, 11);
		const minute = name.slice(11, 13);
		const second = name.slice(13, 15);

		return {
			year,
			month,
			day,
			hour,
			minute,
			second,
		};
	}

	function copyCommands() {
		let commands = importedFiles
			.map((file) => {
				const { name, path } = file;
				const { year, month, day, hour, minute, second } = formatFilename(name);
				const command = `exiftool -AllDates="${year}:${month}:${day} ${hour}:${minute}:${second}" -FileCreateDate="${year}:${month}:${day} ${hour}:${minute}:${second}" -FileModifyDate="${year}:${month}:${day} ${hour}:${minute}:${second}" -overwrite_original '${path}'`;
				return command;
			})
			.join('\n');

		navigator.clipboard.writeText(commands);
	}

	function resetImport() {
		importedFiles = [];
	}

	onMount(() => {
		const dropzone = document.getElementById('dropzone');
		dropzone.addEventListener('dragover', (event) => {
			event.preventDefault();
		});
	});
</script>

<!-- ELEMENTS -->

<div id="dropzone" class="dropzone" class:small={importedFiles.length > 0} on:drop={handleDrop}>
	<div class="dropzone-text">
		<h1>Drag and drop files here</h1>
		<img src="images/import.svg" alt="📥" style="height:55%; max-height:50px" />
	</div>
	<div class="dropzone-note">
		Before importing, please ensure that the file names have the correct scheme:
		<br />
		 YYYYMMDD-HHMMSS ...
	</div>
</div>

<div style="text-align:center;">
	<button on:click={copyCommands}>
		<img src="images/copy.svg" alt="📋" style="height:30%; max-height:40px" />
		<br />
		Copy to clipboard
	</button>
	<button on:click={resetImport}>
		<img src="images/reset.svg" alt="🗑️" style="height:30%; max-height:40px" />
		<br />
		Reset
		<br />
		import
	</button>
</div>

<article>
	<table>
		<thead>
			<tr>
				<th style="width: 12%; min-width:200px; max-width:500px;">DATE</th>
				<th style="width: 12%; min-width:10px; max-width:30px">TIME</th>
				<th style="width: 76%; min-width:30px; max-width:100px">PATH</th>
			</tr>
		</thead>

		<tbody>
			{#each importedFiles as file}
				{#if file.type.startsWith('image/') || file.type.startsWith('video/')}
					<tr>
						<td>
							{formatFilename(file.name).year}-{formatFilename(file.name)
								.month}-{formatFilename(file.name).day}
						</td>
						<td>
							{formatFilename(file.name).hour}:{formatFilename(file.name)
								.minute}:{formatFilename(file.name).second}
						</td>
						<td>{file.path.replace(file.name, '')}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</article>
