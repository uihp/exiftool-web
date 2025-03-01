# exiftool-web

Demo available at [http://exiftool.lucasgelfond.online](https://exiftool.lucasgelfond.online/). 

![output](https://github.com/user-attachments/assets/9b8694ea-28a5-4da3-997d-87eb22096a60)


## Acknowledgements

This would not have been possible without [Andrew Sampson](https://andrew.im/)'s phenomenal package [zeroperl](https://github.com/uswriting/zeroperl) and corresponding [writeup](https://andrews.substack.com/p/zeroperl-sandboxed-perl-with-webassembly?r=44njw&utm_campaign=post&utm_medium=web&triedRedirect=true). (A few days after I built this, they finished up a [dedicated exiftool package](https://github.com/uswriting/exiftool/), that has a nicer API if you're trying to integrate this into another project!) This also would not have been possible without [browser_wasi_shim](https://github.com/bjorn3/browser_wasi_shim), a package that provides WASI support in web browsers, necessary for execution here. 

There's lots of prior art about emulating Perl in the browser that I looked through but didn't end up using, like [perlwasm](https://github.com/perlwasm/Wasm) and [webperl](https://github.com/haukex/webperl). Also helpful was documentation about WASI support in the browser, including "[Building a minimal WASI polyfill for browsers](https://dev.to/ndesmic/building-a-minimal-wasi-polyfill-for-browsers-4nel)", [wasm-cross](https://github.com/ndesmic/wasm-cross/blob/main/browser/wasi.js), [wasmer-js](https://github.com/wasmerio/wasmer-js), [WASI-Virt](https://github.com/bytecodealliance/WASI-Virt), and others.


## Getting Started

All of the code here lives in `frontend`, a standard [Svelte](https://svelte.dev/) webapp. 

Make sure you have [pnpm installed](https://pnpm.io/installation). After this, `git clone` the repo, `cd frontend` and `pnpm install` on the main directory. If you `pnpm dev`, the app should start running! `pnpm build` will make a production-ready version. 


### For Beginners 

Responding to 


## Background


Open source intelligence (OSINT) is a technique used by researchers to glean insights from publicly available data sources. For example, [Bellingcat used metadata](https://www.bellingcat.com/news/2022/02/23/documenting-and-debunking-dubious-footage-from-ukraines-frontlines/) on videos released by Russian separtists to prove that a video was released several days before its stated date. Researchers widely agree that [exiftool](https://exiftool.org/) is the best resource, but it is only available by command-line, and [GUIs](https://exiftool.org/gui/) are Windows-only and many years old. Command-line tools present a large barrier to entry for non-programmer OSINT researchers, because they are non-intuitive to install and use. 

Rather than building another GUI that requires installation, this one runs totally client-side! Using OPFS, we download the WASM executable from CDN (thanks [zeroperl](https://github.com/uswriting/zeroperl)!), connect it to WASI browser shim to emulate the capabilities we need, and then do all of the bridge work with the regular browser file API in order to process multiple files.


## Future Work

It would not be very difficult to add to this tool in a way that would allow you to edit (or totally remove) EXIF data from images and download them, which would be a nice anonymization/privacy ue case. You can think of this somewhat in those terms as well—you can see what you are putting out there! I'm also pretty eager to make this offline-friendly (i.e. with service workers / a browser manifest), and to bundle this as a desktop app: there's a few commits in here of starting to setup Tauri, but I got sidetracked / that will be a project for a different day! 

We're open for patches and issues! Let me know how you find this. 
