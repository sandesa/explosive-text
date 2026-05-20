import { useEffect, useRef } from "react";
import p5 from "p5";

export default function P5Sketch() {
  const containerRef = useRef(null);

  useEffect(() => {
    let sketch = (p) => {
      let chars = [];
      const text =
        "EXPLODE TEST EXPLODE TEST EXPLODE TEST EXPLODE TEST EXPLODE TEST";
      const fontSize = 80;
      const explosionRadius = 200;
      const repulsionForce = 3.0;
      const returnSpeed = 0.08;
      const jitterThreshold = 0.3;
      const explosionOffset = 1.2;
      let isMousePressed = false;

      class Char {
        constructor(char, x, y) {
          this.char = char;
          this.originalX = x;
          this.originalY = y;
          this.x = x;
          this.y = y;
          this.vx = 0;
          this.vy = 0;
        }

        update(mouseX, mouseY, mouseDown) {
          if (mouseDown) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < explosionRadius && distance > 0) {
              // Repulsion force
              const force =
                ((explosionRadius - distance) / explosionRadius) *
                repulsionForce;
              this.vx += (dx / distance) * force;
              this.vy += (dy / distance) * force;
            } else if (distance >= explosionRadius * explosionOffset) {
              // Return char
              returnToOriginalPosition(this, returnSpeed);
            }
          } else {
            // Return char
            returnToOriginalPosition(this, returnSpeed);
          }

          // Damping force
          this.vx *= 0.9;
          this.vy *= 0.9;

          this.x += this.vx;
          this.y += this.vy;

          // Jittering control
          if (
            Math.abs(this.x - this.originalX) < jitterThreshold &&
            Math.abs(this.y - this.originalY) < jitterThreshold
          ) {
            this.x = this.originalX;
            this.y = this.originalY;
            this.vx = 0;
            this.vy = 0;
          }
        }

        display() {
          p.textAlign(p.CENTER, p.CENTER);
          p.text(this.char, this.x, this.y);
        }
      }

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.textSize(fontSize);
        p.fill(255);

        // Initialize chars
        const startX = p.width / 2 - (text.length * fontSize) / 4;
        const startY = p.height / 2;
        chars = [];

        for (let i = 0; i < text.length; i++) {
          const charX = startX + (i * fontSize) / 1.5;
          chars.push(new Char(text[i], charX, startY));
        }
      };

      p.draw = () => {
        p.background(0);
        p.fill(255);
        p.textSize(fontSize);

        chars.forEach((char) => {
          char.update(p.mouseX, p.mouseY, isMousePressed);
          char.display();
        });
      };

      p.mousePressed = () => {
        isMousePressed = true;
        return false;
      };

      p.mouseReleased = () => {
        isMousePressed = false;
        return false;
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };
    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);
  return <div ref={containerRef} />;
}

// HELPER FUNCTIONS

function returnToOriginalPosition(char, returnSpeed) {
  const returnSpeedThreshold = 0.3;

  const dx = char.originalX - char.x;
  const dy = char.originalY - char.y;
  const returnX = Math.abs(dx) > returnSpeedThreshold ? dx * returnSpeed : 0;
  const returnY = Math.abs(dy) > returnSpeedThreshold ? dy * returnSpeed : 0;
  char.vx += returnX * returnSpeed;
  char.vy += returnY * returnSpeed;
}
