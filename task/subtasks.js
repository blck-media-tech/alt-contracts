const { subtask } = require("hardhat/config");

subtask("clean&compile", "Cleans artifacts and compiles contracts").setAction(async (taskArgs, hre) => {
    await hre.run("clean");
    await hre.run("compile");
});

subtask("deployment", "Deploys specified contract").setAction(async (taskArgs, hre) => {
    console.log("\n\nāļø CONFIGURATION\n------------------------------------");
    console.log(`š” Selected network: ${taskArgs.network}`);
    console.log(`š” Contract: ${taskArgs.contract}`);
    console.log(`š” Passed arguments: ${JSON.stringify(taskArgs.arguments, 2, 4)}`);
    console.log("\n\nš DEPLOYMENT\n------------------------------------");
    console.log(`š Deploying ${taskArgs.contract} contract...`);

    let Contract;

    try {
        Contract = await hre.ethers.getContractFactory(taskArgs.contract);
        Contract = await Contract.deploy(...Object.values(taskArgs.arguments));
        await Contract.deployed();
    } catch (error) {
        await hre.run("deploymentError", { error: error, message: error.message, contract: taskArgs.contract });
        process.exit(1);
    }

    console.log(`\n\nā ${taskArgs.contract} deployed to: ${Contract.address}`);
    return Contract.address;
});

subtask("deploymentError", "Notifies about deployment error").setAction(async (taskArgs) => {
    console.log(`\n\nā Deployment of ${taskArgs.contract} failed!`);
    console.log(`ā Message: ${taskArgs.message}`);
});

subtask("verification", "Verifies specified contract").setAction(async (taskArgs, hre) => {
    console.log(`\n\nš Verifying ${taskArgs.contract} contract...`);
    try {
        await hre.run("verify:verify", {
            address: taskArgs.address,
            constructorArguments: taskArgs.constructorArguments,
        });
    } catch (error) {
        console.log(`\n\nā Verification of ${taskArgs.contract} failed!`);
        console.log(`ā Message: ${error.message}`);
        process.exit(1);
    }
});
