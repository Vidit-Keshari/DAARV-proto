//  Copyright (c) 2025 Vidit Keshari Founder VGames
//  All rights reserved
//  This code is a prototype of Project D.A.A.R.V by Innovative Inventors
//  This code will only be used by team Innovative Inventors
//  A VGames production

//  Variables
var sos = false;
var person = false;
const cmd_list = {
    SOS: ["trigger", "stop"],
    appliance: {
        light: ["on", "off"],
        fan: ["on", "off", "0", "1", "2", "3", "4"],
    },
    user_cmd: ["run"],
};
const appliances = {
    light: { state: false },
    fan: { state: false, speed: 2 },
};

//  Setup
window.addEventListener("DOMContentLoaded", () => {
    const clear_btn = document.getElementById("clear");
    const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            clear_btn.style.opacity = 1;
        } else {
            clear_btn.style.opacity = 0;
        }
    },
        {
            root: null,
            threshold: 0.01
        }
    );
    observer.observe(document.getElementById("simulator"));

   document.getElementById("text-inp").addEventListener("keydown", e => {
    if (e.key == "Enter") {
        document.getElementById("cmd-btn").click();
    }
   }); 
});

//  Functions
//  Toggle systems
function toggleSOS() {
    sos = !sos;
    if (sos) {
        let cmd = "SOS trigger";
        runCmd(cmd);
    } else {
        let cmd = "SOS stop";
        runCmd(cmd);
    }
}

function togglePerson() {
    person = !person;
    if (person) {
        document.getElementById("person-btn").textContent = "Person found in room";
        runCmd("appliance light on");
        runCmd("appliance fan on");
    } else {
        document.getElementById("person-btn").textContent = "No one in room";
        runCmd("appliance light off");
        runCmd("appliance fan off");
    }
}

function toggleAppliance(appliance) {
    appliances[appliance].state = !appliances[appliance].state;
    if (appliances[appliance].state) {
        runCmd(`appliance ${appliance} on`);
    } else {
        runCmd(`appliance ${appliance} off`);
    }
}

//  Set
function setFanSpeed(speed = 2) {
    const ele = document.getElementById("fan");
    speed = parseInt(speed);
    appliances.fan.speed = speed;
    document.getElementById("fan-speed-disp").textContent = speed;
    if (speed == 4) speed = 1
    else if (speed == 1) speed = 4
    else if (speed == 2) speed = 3
    else if (speed == 3) speed = 2
    ele.style.setProperty("--speed", `${speed}s`);
}

//  Logs
function logOutput(output = "") {
    const ele = document.createElement("li");
    ele.textContent = output;
    document.getElementById("logs").appendChild(ele);
}

function logError(err = "") {
    const ele = document.createElement("li");
    ele.textContent = err;
    ele.style.color = "red";
    document.getElementById("logs").appendChild(ele);
}

function clearLogs() {
    document.getElementById("logs").innerHTML = "<li>Output console was cleared</li>";
}

//  Signal appliance
function showSignal(signal) {
    const container = document.getElementById("signal-output");
    const ele = document.createElement("li");
    ele.textContent = signal;
    container.appendChild(ele);
    setTimeout(() => {
        ele.remove();
    }, 2000);
}

//  Voice/Text commands
function runCmd(command) {
    let parts = command.trim().split(" ");
    if (!cmd_list[parts[0]]) {
        logError(`Command not found: ${parts[0]}`);
        return;
    }
    if (parts[1] && !parts[2]) {
        if (!cmd_list[parts[0]].includes(parts[1])) {
            logError(`${command} is not a command action`);
            return;
        }
    }
    if (parts[2]) {
        if (!cmd_list[parts[0]][parts[1]].includes(parts[2])) {
            logError(`${parts[1]} does not have any argument: ${parts[2]}`);
            return;
        }
    }
    handleCmd(parts, command);
}

function runUsrCmd() {
    let cmd = document.getElementById("text-inp").value;

    cmd.trim();
    if (cmd === "") {
        let error = "Command recieved was empty";
        logError(`Command '${cmd} exited with error: ${error}`);
        return;
    }

    let parts = cmd.split(" ");
    if (!cmd_list[parts[0]]) {
        logError(`Command not found: ${parts[0]}`);
        return;
    }

    if (["user_cmd run"].includes(cmd)) {
        logError("Command '" + cmd + "' could not be passed, recurssion found.");
        return;
    }
    runCmd(cmd);
}

function handleCmd(parts, command) {
    if (parts[0] == "SOS") {
        let sound = document.getElementById("sos-sound");
        let btn = document.getElementById("sos-btn");
        if (parts[1] == "trigger") {
            try {
                sos = true;
                sound.play();
                sound.volume = 0.5;
                btn.textContent = "Stop SOS alert";
                btn.style.color = "red";
                logOutput("Command run: " + command);
            } catch (err) {
                logError(`Command '${command}' exited with error: ${err.message}`);
            }
        } else if (parts[1] == "stop") {
            try {
                sos = false;
                sound.pause();
                btn.textContent = "Trigger SOS";
                btn.style.color = "cyan";
                logOutput("Command run: " + command);
            } catch (err) {
                logError(`Command '${command}' exited with error: ${err.message}`);
            }
        }
    } else if (parts[0] == "user_cmd") {
        if (parts[1] == "run") {
            try {
                runUsrCmd();
                document.getElementById("text-inp").value = "";
                logOutput(`Command run: ${command}`);
            } catch (err) {
                logError(`Command '${command}' exited with error: ${err.message}`);
            }
        }
    } else if (parts[0] == "appliance") {
        if (parts[1] == "light") {
            const ele = document.getElementById("light");
            if (parts[2] == "on") {
                try {
                    appliances.light.state = true;
                    if (!ele.classList.contains("on")) {
                        ele.classList.add("on");
                    }
                    logOutput("Command run: " + command);
                } catch (err) {
                    logError(`Command '${command}' exited with error: ${err.message}`);
                }
            } else if (parts[2] == "off") {
                try {
                    appliances.light.state = false;
                    if (ele.classList.contains("on")) {
                        ele.classList.remove("on");
                    }
                    logOutput("Command run: " + command);
                } catch (err) {
                    logError(`Command '${command}' exited with error: ${err.message}`);
                }
            }
            showSignal("appliances.light.state = " + appliances.light.state);
            setTimeout(() => {
                if (!person && appliances.light.state) {
                    runCmd(`appliance light off`);
                    logOutput(`Appliance 'light' turned off because no one was found in the room`);
                }
            }, 2000);
        } else if (parts[1] == "fan") {
            const ele = document.getElementById("fan");
            if (parts[2] == "on") {
                try {
                    appliances.fan.state = true;
                    if (!ele.classList.contains("on")) {
                        setFanSpeed(parseInt(document.getElementById("fan-speed").value));
                        ele.classList.add("on");
                    }
                    logOutput("Command run: " + command);
                } catch (err) {
                    logError(`Command '${command}' exited with error: ${err.message}`);
                }
                showSignal("appliances.fan.state = " + appliances.fan.state);
                 setTimeout(() => {
                    if (!person && appliances.fan.state) {
                        runCmd(`appliance fan off`);
                        logOutput(`Appliance 'fan' turned off because no one was found in the room`);
                    }
                }, 2000);
            } else if (parts[2] == "off") {
                try {
                    appliances.fan.state = false;
                    if (ele.classList.contains("on")) {
                        ele.classList.remove("on");
                    }
                    logOutput("Command run: " + command);
                } catch (err) {
                    logError(`Command '${command}' exited with error: ${err.message}`);
                }
                showSignal("appliances.fan.state = " + appliances.fan.state);
            } else {
                try {
                    setFanSpeed(parts[2]);
                    logOutput("Command run: " + command);
                } catch (err) {
                    logError(`Command '${command}' exited with error: ${err.message}`);
                }
                showSignal("appliances.fan.speed = " + appliances.fan.speed);
            }
        }
    }
}
