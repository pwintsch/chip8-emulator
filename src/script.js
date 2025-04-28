var currentRom = ""; // No Default ROM file
var debugMode = true;

// Setup sreen

var myX = 1;
var myY = 1;

// Chip8 machine fontset

const fontset = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];

/// Crashing 

// Example sprite (letter "A" shape)
const test_sprite = [
    0b01100000,
    0b10010000,
    0b11110000,
    0b10010000,
    0b10010000,
  ];

class Chip8Display {
    constructor(canvas, width = 64, height = 32) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = width;
      this.height = height;
  
      // Set physical canvas size
      canvas.width = width;
      canvas.height = height;
  
      this.imageData = this.ctx.createImageData(width, height);
      this.data = this.imageData.data;
  
      // Optional: clear screen on startup
      this.clear();
      this.render();
    }
  
    clear() {
      for (let i = 0; i < this.data.length; i += 4) {
        this.data[i] = 0;
        this.data[i + 1] = 0;
        this.data[i + 2] = 0;
        this.data[i + 3] = 255;
      }
    }
  
    drawSprite(vx, vy, sprite) {
      let collision = 0;
  
      for (let row = 0; row < sprite.length; row++) {
        let spriteByte = sprite[row];
  
        for (let bit = 0; bit < 8; bit++) {
          let pixel = (spriteByte >> (7 - bit)) & 1;
  
          let x = (vx + bit) % this.width;
          let y = (vy + row) % this.height;
          let pixelIndex = (y * this.width + x) * 4;
  
          if (pixel) {
            let isCurrentlyOn = this.data[pixelIndex] === 255;
  
            if (isCurrentlyOn) {
              collision = 1;
            }
  
            let newColor = isCurrentlyOn ? 0 : 255;
  
            this.data[pixelIndex] = newColor;
            this.data[pixelIndex + 1] = newColor;
            this.data[pixelIndex + 2] = newColor;
            this.data[pixelIndex + 3] = 255;
          }
        }
      }
  
      return collision;
    }
  
    render() {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
  }
    // Initialize the Chip8 screen  



function startCPU() {
    // Initialize the Chip8 screen
    // myScreen.start(id);
    chipCPU.setupScreen();
}


var chipCPU = {
    // CPU state variables
    memory: new Uint8Array(4096), // 4KB of memory
    V: new Uint8Array(16), // 16 registers (V0 to VF)
    I: 0, // Index register
    PC: 0x200, // Program counter starts at 0x200
    stack: [], // Stack for subroutine calls
    SP: 0, // Stack pointer
    delayTimer: 0,
    soundTimer: 0,
    setupScreen: function() {
        // Setup the screen (this is a placeholder, implement actual screen setup)
        const canvas = document.getElementById('chip8-screen');
        display = new Chip8Display(canvas);
    },
    loadROM: function(rom) {

        this.interval = setInterval(() => {
            updateScreen();
        }, 20);
        keyPress();
        // Fetch the ROM file
        // fetch('assets/chip8-logo.ch8')
        fetch('assets/' + rom)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            const byteArray = new Uint8Array(arrayBuffer);
            // reinitialize Memory
            this.memory.fill(0); // Clear memory
            
            // Load the fontset into memory
            for (let i = 0; i < fontset.length; i++) {
                this.memory[i] = fontset[i];
            } 

            // Load the ROM into memory starting at address 0x200
            for (let i = 0; i < byteArray.length; i++) {
                this.memory[0x200 + i] = byteArray[i];
            }
            this.I = 0;
            this.PC = 0x200;
            this.clearScreen();
            this.stack = [];
            this.SP = 0;
            // Initialize registers to 0
            for (let i = 0; i < this.V.length; i++) {
                this.V[i] = 0;
            }
            const outputDiv = document.getElementById("cpu-output-content");
            if (outputDiv) {
                outputDiv.innerHTML = "<tt>ROM " + currentRom + " loaded successfully</tt><br>";
                //outputDiv.innerHTML += "Memory: " + this.memory[0x200].toString(16).padStart(2, '0').toUpperCase() + " " + this.memory[0x201].toString(16).padStart(2, '0').toUpperCase();
            }
        })

    },
    clearScreen: function() {
        // Clear the screen (this is a placeholder, implement actual screen clearing)
        display.clear();
    },
    executeInstruction: function() {
        // Fetch the instruction at the current program counter
        b1 = this.memory[this.PC];
        b2 = this.memory[this.PC + 1];
        currentAddr = "addr: "+ this.PC.toString(16).padStart(4, '0').toUpperCase();
        // Increment the program counter by 2
        this.PC += 2;
        // Decode and execute the instruction

        n2 = b1 & 15;
        n1 = b1 >> 4;
        n4 = b2 & 15;
        n3 = b2 >> 4;
        addr = (n2 * 256) + b2;
        cmd = "";
        switch (n1) {
            case 0x00:    
                if (n2 == 0x0) {
                    if (b2 == 0xE0) {  // CLS command
                        cmd = "";
                        this.clearScreen();
                    } else if (b2 == 0xEE) {
                        cmd = "TBD"; // "RET";
                    }
                } else {
                    cmd = "TBD"; // "SYS " + addr.toString(16).padStart(3, '0').toUpperCase();
                }
                break;
            case 0x01:      // JP addr
                cmd = ""; 
                this.PC = addr;
                break;
            case 0x02:     // CALL addr
                cmd = ""; 
                this.stack[this.SP] = this.PC;
                this.SP++;
                this.PC = addr;
                break;
            case 0x03:          // SE Vx, byte
                cmd = ""; 
                if (this.V[n2] == b2) {
                    this.PC += 2;
                }
                break;
            case 0x04:         // SNE Vx, byte
                cmd = ""; 
                if (this.V[n2] != b2) {
                    this.PC += 2;
                }
                break;
            case 0x05:      // SE Vx, Vx
                cmd = ""; 
                if (this.V[n2] == this.V[n3]) {
                    this.PC += 2;
                }
                break;
            case 0x06:          // LD Vx, byte                          
                cmd = ""; 
                this.V[n2] = b2;
                break;
            case 0x07:          // ADD Vx, byte
                cmd = ""; 
                this.V[n2] = (this.V[n2] + b2) & 0xFF;
                break;
            case 0x08:
                switch (n4) {
                    case 0x0:      // LD Vx, Vy
                        cmd = ""; 
                        // Set the result in Vx
                        this.V[n2] = this.V[n3];
                        break;
                    case 0x1:       // OR Vx, Vy
                        cmd = ""; 
                        // Set the result in Vx
                        this.V[n2] = this.V[n2] | this.V[n3];
                        break;
                    case 0x2:      // AND Vx, Vy
                        cmd = "";
                        // Set the result in Vx
                        this.V[n2] = this.V[n2] & this.V[n3];
                        break;
                    case 0x3:      // XOR Vx, Vy
                        cmd = ""; 
                        // Set the result in Vx
                        this.V[n2] = this.V[n2] ^ this.V[n3];
                        break;
                    case 0x4:      // ADD Vx, Vy
                        cmd = ""; 
                        // Set VF to 1 if there is no carry
                        if (this.V[n2] + this.V[n3] > 0xFF) {
                            this.V[0xF] = 1; // Set VF to 1 if there is a carry
                        } else {
                            this.V[0xF] = 0; // Set VF to 0 if there is no carry
                        }
                        // Set the result in Vx
                        this.V[n2] = (this.V[n2] + this.V[n3]) & 0xFF; // Mask to 8 bits
                        break;
                    case 0x5:         // SUB Vx, Vy
                        cmd = ""; // "SUB V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                        // Set VF to 1 if there is no borrow
                        if (this.V[n2] >= this.V[n3]) {
                            this.V[0xF] = 1; // Set VF to 1 if there is no borrow
                        } else {
                            this.V[0xF] = 0; // Set VF to 0 if there is a borrow
                        }
                        // Set the result in Vx
                        this.V[n2] = (this.V[n2] - this.V[n3]) & 0xFF;                   
                        break;
                    case 0x6:       // SHR Vx, Vy
                        cmd = ""; 
                        // Set VF to 1 if the least significant bit of Vx is 1
                        if ((this.V[n2] & 0x1) != 0) {
                            this.V[0xF] = 1; // Set VF to 1 if the least significant bit of Vx is 1
                        }
                        else {
                            this.V[0xF] = 0; // Set VF to 0 if the least significant bit of Vx is 0
                        }
                        // Shift Vx right by 1
                        this.V[n2] = (this.V[n2] >> 1) & 0xFF;
                        break;
                    case 0x7:         // SUBN Vx, Vy
                        cmd = ""; 
                        if (this.V[n3] >= this.V[n2]) {
                            this.V[0xF] = 1; // Set VF to 1 if there is no borrow
                        }
                        else {
                            this.V[0xF] = 0; // Set VF to 0 if there is a borrow
                        }
                        // Set the result in Vx
                        this.V[n2] = (this.V[n3] - this.V[n2]) & 0xFF;
                        break;
                    case 0xE:       // SHL Vx, Vy
                        cmd = ""; 
                        // Set VF to 1 if the most significant bit of Vx is 1
                        if ((this.V[n2] & 0x80) != 0) {
                            this.V[0xF] = 1; // Set VF to 1 if the most significant bit of Vx is 1
                        } else {
                            this.V[0xF] = 0; // Set VF to 0 if the most significant bit of Vx is 0
                        }
                        // Shift Vx left by 1
                        this.V[n2] = (this.V[n2] << 1) & 0xFF;
                        break;
                    default:
                        cmd = "???";
                }
                break;
            case 0x09:        // SNE Vx, Vy
                cmd = "";
                if (this.V[n2] != this.V[n3]) {
                    this.PC += 2;
                }
                break;
            case 0x0A:                  // LD I, addr
                cmd = "";
                this.I = addr;
                break;
            case 0x0B:      // JP V0, addr
                cmd = ""; 
                this.PC = this.V[0] + addr;               
                break;
            case 0x0C:        // RND Vx, byte
                cmd = ""; 
                this.V[n2] = Math.floor(Math.random() * 256) & b2;
                break;
            case 0x0D:         // DRW Vx, Vy, nibble
                cmd = ""; 
                sprite_to_draw = this.memory.slice(this.I, this.I + n4);
                display.drawSprite(this.V[n2], this.V[n3], sprite_to_draw);
                break;
            case 0x0E:
                switch (b2) {
                    case 0x9E:
                        cmd = "TBD"; // "SKP V" + n2.toString(16).padStart(1, '0').toUpperCase();
                        break;
                    case 0xA1:
                        cmd = "TBD"; // "SKNP V" + n2.toString(16).padStart(1, '0').toUpperCase();
                        break;
                    default:
                        cmd = "TBD"; // "???";
                }
                break;
            case 0x0F:
                switch (b2) {
                    case 0x07:
                        cmd = "TBD"; // "LD V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", DT";
                        break;
                    case 0x0A:
                        cmd = "TBD"; // "LD V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", K";
                        break;
                    case 0x15:
                        cmd = "TBD"; // "LD DT, V" + n2.toString(16).padStart(1, '0').toUpperCase();
                        break;
                    case 0x18:
                        cmd = "TBD"; // "LD ST, V" + n2.toString(16).padStart(1, '0').toUpperCase();
                        break;
                    case 0x1E:      // ADD I, Vx
                        cmd = ""; 
                        this.I += this.V[n2];
                        if (this.I > 0xFFF) {
                            this.V[0xF] = 1; // Set VF to 1 if there is a carry
                        } else {
                            this.V[0xF] = 0; // Set VF to 0 if there is no carry
                        }
                        this.I = this.I & 0xFFF; // Mask I to 12 bits
                        break;
                    case 0x29:          // LD F, Vn   -  Set I = location of sprite for digit Vx.
                        cmd = "TBD Load font sprites"; 
                        this.I = this.V[n2] * 5; // Assuming a font set of 5 bytes per character
                        break;
                    case 0x33:      // LD B, Vx   -  Store BCD representation of Vx in memory locations I, I+1, and I+2.
                        cmd = ""; 
                        this.memory[this.I] = this.V[n2] / 100;
                        this.memory[this.I + 1] = (this.V[n2] / 10) % 10;
                        this.memory[this.I + 2] = this.V[n2] % 10;
                        //this.I += 3; // Increment I by 3 after storing BCD
                        break;
                    case 0x55:      // LD [I], Vx   -  Store registers V0 to Vx in memory starting at address I.
                        cmd = ""; 
                        for (let i = 0; i <= n2; i++) {
                            this.memory[this.I + i] = this.V[i];
                        }
                        //this.I += n2 + 1; // Increment I by the number of registers stored
                        break;
                    case 0x65:     // LD Vx, [I]   -  Read registers V0 to Vx from memory starting at address I.
                        cmd = ""; 
                        for (let i = 0; i <= n2; i++) {
                            this.V[i] = this.memory[this.I + i];
                        }
                        //this.I += n2 + 1; // Increment I by the number of registers read
                        break;
                    default:
                        cmd = "TBD"; // "???";
                }
                break;
            default:
                cmd = "UNKNOWN";
        }
        returnStr = "";
        instr_done = false;
        if (cmd != "TBD") {
            instr_done = true;
        }

        if (debugMode) {
            returnStr +=  disassemble_instruction (b1, b2);
        }
        if (instr_done) {
            returnStr = "* " + currentAddr  + "  -   " + returnStr;
        } else {
            returnStr = "<b> " + currentAddr + " </b>  -   " + returnStr;
        }
        return returnStr;
        // memStr =  "0x" + b1.toString(16).padStart(2, '0').toUpperCase() + b2.toString(16).padStart(2, '0').toUpperCase();
        // return memStr + " " + cmd;
    },
    wrappedExec: function() {
        instr_processed = true;
        noOfExecs = 0;
        while (instr_processed == true) {
            // Wrap the executeInstruction method to ensure it is called correctly
            str = this.executeInstruction();
            // Check if the instruction was processed
            console.log("Instruction processed: " + str);
            if (str[0] != "*" || noOfExecs > 100) {
                instr_processed = false;
            }
            noOfExecs++;
            // display the instruction in div with id = "cpu-output-content" with state of registers
            const outputDiv = document.getElementById("cpu-output-content");
            if (outputDiv) {
                // Display the state of registers
                let regState = "<tt>"  + str + "<br>" + "Registers: ";
                for (let i = 0; i < this.V.length; i++) {
                    regState += "V" + i.toString(16).padStart(1, '0').toUpperCase() + ": " + this.V[i].toString(16).padStart(2, '0').toUpperCase() + "<br>";
                }
                regState += "I: " + this.I.toString(16).padStart(3, '0').toUpperCase() + "<br>" + "PC: " + this.PC.toString(16).padStart(4, '0').toUpperCase() + "<br>"+ "</tt>";
                outputDiv.innerHTML = regState ;
            } else {
                console.error('Div with id "cpu-output-content" not found.');
            }
        }
    }
};


function disassemble_instruction(b1, b2) {
    n2 = b1 & 15;
    n1 = b1 >> 4;
    n4 = b2 & 15;
    n3 = b2 >> 4;
    addr = (n2 * 256) + b2;
    switch (n1) {
        case 0x00:    
            if (n2 == 0x0) {
                if (b2 == 0xE0) {
                    cmd = "CLS";
                } else if (b2 == 0xEE) {
                    cmd = "RET";
                }
            } else {
                cmd = "SYS " + addr.toString(16).padStart(3, '0').toUpperCase();
            }
            break;
        case 0x01:
            cmd = "JP " + addr.toString(16).padStart(3, '0').toUpperCase();
            break;
        case 0x02:
            cmd = "CALL " + addr.toString(16).padStart(3, '0').toUpperCase();
            break;
        case 0x03:
            cmd = "SE V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", " + b2.toString(16).padStart(2, '0').toUpperCase();
            break;
        case 0x04:
            cmd = "SNE V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", " + b2.toString(16).padStart(2, '0').toUpperCase();
            break;
        case 0x05:
            cmd = "LD I, " + addr.toString(16).padStart(3, '0').toUpperCase();
            break;
        case 0x06:                            
            cmd = "LD V"+ n2.toString(16).padStart(1, '0').toUpperCase() + ", " + b2.toString(16).padStart(2, '0').toUpperCase();
            break;
        case 0x07:
            cmd = "ADD 	V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", " + b2.toString(16).padStart(2, '0').toUpperCase();
            break;
        case 0x08:
            switch (n4) {
                case 0x0:
                    cmd = "LD V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x1:
                    cmd = "OR V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x2:
                    cmd = "AND V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x3:
                    cmd = "XOR V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x4:
                    cmd = "ADD V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x5:
                    cmd = "SUB V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x6:
                    cmd = "SHR V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x7:
                    cmd = "SUBN V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0xE:
                    cmd = "SHL V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase();
                    break;
                default:
                    cmd = "???";
            }
            break;
        case 0x09:
            cmd = "SNE V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", " + b2.toString(16).padStart(2, '0').toUpperCase();
            break;
        case 0x0A:
            cmd = "LD I, " + addr.toString(16).padStart(3, '0').toUpperCase();
            break;
        case 0x0B:
            cmd = "JP V0, " + addr.toString(16).padStart(3, '0').toUpperCase();
            break;
        case 0x0C:
            cmd = "RND V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", " + b2.toString(16).padStart(2, '0').toUpperCase();
            break;
        case 0x0D:
            cmd = "DRW V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", V" + n3.toString(16).padStart(1, '0').toUpperCase() + ", " + n4.toString(16).padStart(1, '0').toUpperCase();
            break;
        case 0x0E:
            switch (b2) {
                case 0x9E:
                    cmd = "SKP V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0xA1:
                    cmd = "SKNP V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                default:
                    cmd = "???";
            }
            break;
        case 0x0F:
            switch (b2) {
                case 0x07:
                    cmd = "LD V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", DT";
                    break;
                case 0x0A:
                    cmd = "LD V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", K";
                    break;
                case 0x15:
                    cmd = "LD DT, V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x18:
                    cmd = "LD ST, V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x1E:
                    cmd = "ADD I, V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x29:
                    cmd = "LD F, V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x33:
                    cmd = "LD B, V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x55:      
                    cmd = "LD [I], V" + n2.toString(16).padStart(1, '0').toUpperCase();
                    break;
                case 0x65:
                    cmd = "LD V" + n2.toString(16).padStart(1, '0').toUpperCase() + ", [I]";
                    break;
                default:
                    cmd = "???";
            }
            break;
        default:
            cmd = "Not IMPLEMENTED";
    } 
    memStr = b1.toString(16).padStart(2, '0').toUpperCase() + b2.toString(16).padStart(2, '0').toUpperCase();
    return memStr + " " + cmd;
}

function stepCPU() {
    // Execute a single instruction
    chipCPU.wrappedExec();
    // Update the screen
    // updateScreen();
}

function keyPress() {
    // Handle key press events
    document.addEventListener('keydown', function(event) {
        // You can handle key events here
        console.log("Key pressed: " + event.key);
        // For example, you could change the color of the rectangle based on the key pressed
        if (event.key === 'q') {
            myY -= 1;
            if (myY < 8) {
                myY = 24;
            }
        } else if (event.key === 'a') {
            myY += 1;
            if (myY > 310) {
                myY = 10;
            }
        }
    });
}

function updateScreen() {

    // Here you would typically update the game state and redraw the screen
    // For example, you could draw a rectangle:
    //myScreen.context.fillStyle = "green";
    //myScreen.context.fillRect(myScreen.circleX, myScreen.circleY, 10, 10);
    // ;
    /*
        myX += 1;
        if (myX > 55) {
            myX = 1;
        }
        // Draw it at (5, 5)
        display.drawSprite(myX, myY, test_sprite);
    */
    display.render();
}

// LoadRom function set vale of ROM to be fetched

function loadROM(rom_file) {
    currentRom = rom_file+".ch8";
    console.log("ROM file set to: " + currentRom);
    // load ROM in CPU
    chipCPU.loadROM(currentRom);

}


// Function to fetch the ROM file and display its contents


function disassemble() {
    // Fetch the ROM file
    // fetch('assets/chip8-logo.ch8')
    fetch('assets/' + currentRom)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.arrayBuffer();
        })
        .then(arrayBuffer => {
            const byteArray = new Uint8Array(arrayBuffer);
            // Process the byteArray as needed
            // console.log(byteArray);
            console.log("ROM loaded successfully: " + currentRom);
            // print message in div with id = "cpu-output-content"
            const outputDiv = document.getElementById("disassembly-content");
            str = "<tt>";
            if (outputDiv) {
                for (var j = 0; j < byteArray.length; j+=2){
                    b1 = byteArray[j];
                    b2 = byteArray[j+1];
                    instr = disassemble_instruction(b1, b2);
                    index = (j+0x0200).toString(16).padStart(4, '0');
                    str += index + " : " + byteArray[j].toString(16).padStart(2, '0').toUpperCase();
                    str += byteArray[j+1].toString(16).padStart(2, '0').toUpperCase();
                    str += "  " + cmd + "<br>";    
                }
                str += "</tt>";
                outputDiv.innerHTML = "ROM loaded successfully" + "<br>Current ROM is  " + currentRom + "<br>" + str;
            } else {
                console.error('Div with id "cpu-output-content" not found.');
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


