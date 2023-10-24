import fs from "fs";

let targets: any = [
    "OCPRouter",
    "OCPBridge",
    "OCPOmniTokenManager",
    "USDC",
    "esZKDX"
]

let result: any = {
    "zksync_testnet": {},
    "goerli": {},
    "base_testnet": {}
}

async function main() {

    console.log("=== merge abi start at %s ===", new Date().toString());

    addresses("zksync_testnet");
    addresses("goerli");
    addresses("base_testnet");

    fs.writeFileSync('scripts/files/addresses.json', JSON.stringify(result));

    console.log("=== merge abi end at %s ===", new Date().toString());
}

function addresses(network: string) {
    let fullPath = "deployments/" + network;

    try {
        const files = fs.readdirSync(fullPath);
        files.forEach(function (file: string) {

            let index = file.indexOf(".json");
            if (index < 0)
                return;

            let data = JSON.parse(fs.readFileSync(fullPath + "/" + file, {encoding: 'utf-8'}));
            let contractName = file.substring(0, index);

            if (targets.includes(contractName)) {
                result[network][contractName] = data["address"];
            }
        });
    } catch (error) {
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

