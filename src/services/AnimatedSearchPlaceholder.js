export default class AnimatedSearchPlaceholder {
  isCancelled = false;
  typingSpeed = 70;
  delayNextPhrase = 1000;
  phrases = [];
  inputElement = null;
  defaultPlaceholder = null;

  init = (phrases, el, defaultPlaceholder = '') => {
    this.phrases = phrases;
    this.inputElement = el;
    this.defaultPlaceholder = defaultPlaceholder;
  };

  printPhrases = async () => {
    this.isCancelled = false;

    let err = null;
    let nextIndex = 0;

    const run = async (phrase) => {
      await this.printPhrase(phrase)
        .then(() => {
          // create loop
          if (nextIndex === this.phrases.length) {
            nextIndex = 0;
          } else {
            nextIndex++;
          }

          if (!err) {
            run(this.phrases[nextIndex]);
          }
        })
        .catch((err) => {
          err = err;
        });
    };

    await run(this.phrases[0]);
  };

  printPhrase = async (phrase) => {
    return new Promise((resolve, reject) => {
      // Clear placeholder before typing next phrase
      // TODO - remove letters

      this.clearPlaceholder(this.inputElement);

      let letters = phrase.split('');
      // For each letter in phrase
      letters.reduce(
        (promise, letter, index) =>
          promise.then((_) => {
            // stop the chain with flag
            if (this.isCancelled) {
              reject('cancelled');
            } else {
              // Resolve promise when all letters are typed
              if (index === letters.length - 1) {
                // Delay before start next phrase "typing"
                setTimeout(resolve, this.delayNextPhrase);
              }

              return this.addToPlaceholder(letter, this.inputElement);
            }
          }),
        Promise.resolve()
      );
    });
  };

  clearPlaceholder = (el) => {
    el.setAttribute('placeholder', '');
  };

  addToPlaceholder = (toAdd, el) => {
    el.setAttribute('placeholder', el.getAttribute('placeholder') + toAdd);

    return new Promise((resolve) => setTimeout(resolve, this.typingSpeed));
  };

  cancelPrintPhrases = () => {
    this.isCancelled = true;
    [50, 100, 500, 100].forEach((t) => {
      setTimeout(() => {
        if (this.isCancelled) {
          this.inputElement.setAttribute('placeholder', this.defaultPlaceholder);
        }
      }, t);
    });
  };
}
