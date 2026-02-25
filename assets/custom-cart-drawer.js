class CustomCartDrawer extends HTMLElement {
  constructor() {
    super();

    this.OperTrigger = document.querySelector(`#${this.dataset.openTrigger}`);
    this.overlay = this.querySelector("#CustomCartOverlay");
    this.closeButton = this.querySelector("[data-close]");
  }

  connectedCallback() {
    this.OperTrigger.addEventListener("click", this.handleOpen.bind(this));
    this.closeButton?.addEventListener("click", this.closeDrawer.bind(this));
    document.addEventListener("click", (event) => {
      if (event.target === this.overlay) {
        this.closeDrawer();
      }
    });

    document.addEventListener("cart:rerender", this.cartRerender.bind(this));
    document.addEventListener("cart:open", this.openDrawer.bind(this));
  }

  handleOpen(event) {
    event.preventDefault();
    this.openDrawer();
  }

  openDrawer() {
    this.setAttribute("open", "");
  }

  closeDrawer() {
    this.removeAttribute("open");
  }

  cartRerender(event) {
    const fakeElement = document.createElement("div");
    const newHtml = event.detail.sections["custom-cart-drawer"];
    fakeElement.innerHTML = newHtml;
    this.querySelector(".custom-cart-drawer__inner").innerHTML =
      fakeElement.querySelector(".custom-cart-drawer__inner").innerHTML;
    this.openDrawer();
  }
}

if (!customElements.get("custom-cart-drawer")) {
  customElements.define("custom-cart-drawer", CustomCartDrawer);
}

class CtaButton extends HTMLElement {
  constructor() {
    super();

    this.submitForm = this.querySelector("form");
  }

  connectedCallback() {
    this.submitForm?.addEventListener("submit", this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log("prevented");

    document.documentElement.dispatchEvent(
      new CustomEvent("cart:open", {
        bubbles: true,
      }),
    );

    let formData = {
      items: [
        {
          id: this.submitForm.querySelector("input[name='id']").value,
          quantity: this.submitForm.querySelector("input[name='quantity']")
            .value,
        },
      ],
      sections: "custom-cart-drawer",
    };

    fetch(window.Shopify.routes.root + "cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        document.documentElement.dispatchEvent(
          new CustomEvent("cart:rerender", {
            detail: data,
            bubbles: true,
          }),
        );
      })
      .catch((error) => {
        console.error("Error adding item to cart:", error);
      });
  }
}

if (!customElements.get("cta-button")) {
  customElements.define("cta-button", CtaButton);
}
