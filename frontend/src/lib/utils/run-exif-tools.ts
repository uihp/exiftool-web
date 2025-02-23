import { WASI, WASIProcExit } from '@bjorn3/browser_wasi_shim';
import { parseExifOutput } from './parse-exif-output';
import { PreopenDirectory, File } from '@bjorn3/browser_wasi_shim';
import { instantiate } from './asyncify.mjs';
import { Fd } from '@bjorn3/browser_wasi_shim';
import type { ParsedOutput } from '$lib/types/parsed-output';
import { fetchZeroPerl } from './fetch-zeroperl';

class CustomFd extends Fd {
	private collectedOutput = '';

	fd_write(data: Uint8Array): { ret: number; nwritten: number } {
		const text = new TextDecoder().decode(data);
		console.log('WASI output:', text); // Debug output
		this.collectedOutput += text;
		return { ret: 0, nwritten: data.length };
	}

	getOutput(): string {
		return this.collectedOutput;
	}
}

async function runExifTools(browserFile: globalThis.File): Promise<ParsedOutput> {
	try {
		const fileName = browserFile.name;
		const imageData = await browserFile.arrayBuffer();

		const perlScript = `
        use Image::ExifTool;
        my $exif = Image::ExifTool->new();      

        $exif->Options(Unknown => 1);  # Show unknown tags  

        my $info = $exif->ImageInfo("${fileName}");
        if ($exif->GetValue("Error")) {
            print "Error: " . $exif->GetValue("Error") . "\\n";
        } else {
            foreach my $tag (sort keys %$info) {
                my $val = $info->{$tag};
                print "$tag: $val\\n";
            }
        }
        `;

		const stdout = new CustomFd();
		const stderr = new CustomFd();

		// Create WASI instance with increased memory limits
		const wasi = new WASI(
			['perl', '-e', perlScript],
			['LC_ALL=C', 'PERL_UNICODE=SD'], // Added PERL_UNICODE for better string handling
			[
				new CustomFd(), // stdin (fd 0)
				stdout, // stdout (fd 1)
				stderr, // stderr (fd 2)
				new PreopenDirectory('/dev', new Map([['null', new File(new Uint8Array())]])),
				new PreopenDirectory('.', new Map([[fileName, new File(new Uint8Array(imageData))]]))
			],
			{
				debug: true
			}
		);

		// Set up imports with memory configuration
		const imports = {
			wasi_snapshot_preview1: wasi.wasiImport,
			env: {
				memory: new WebAssembly.Memory({
					initial: 100, // Initial memory in pages (6.4MB)
					maximum: 1000, // Maximum memory in pages (64MB)
					shared: false
				})
			}
		};

		// In browser we'll need to fetch the wasm file
		const wasmBuffer = await fetchZeroPerl();

		console.log('Loading WASM...');
		const { instance } = await instantiate(wasmBuffer, imports);
		console.log('WASM loaded successfully');

		try {
			wasi.start(instance as { exports: { memory: WebAssembly.Memory; _start: () => void } });
		} catch (e) {
			if (e instanceof WASIProcExit) {
				console.log(`ExifTool exited with code ${e.code}`);
				if (e.code !== 0) {
					console.error('ExifTool error:', stderr.getOutput());
					throw new Error(`ExifTool exited with code ${e.code}`);
				}
			} else {
				throw e;
			}
		}

		const output = stdout.getOutput();
		const parsedOutput = parseExifOutput(output);
		return parsedOutput;
	} catch (error) {
		console.error('Error running ExifTool:', error);
		throw new Error('Failed to run ExifTool');
	}
}

export { runExifTools };
