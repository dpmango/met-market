export default class AnimatedSearchPlaceholder {
  isCancelled = false;
  typingSpeed = 70;
  delayNextPhrase = 300;
  phrases = [];
  inputElement = null;
  defaultPlaceholder = null;
  nextIndex = 0;

  init = (phrases, el, defaultPlaceholder = '') => {
    this.phrases = phrases;
    this.inputElement = el;
    this.defaultPlaceholder = defaultPlaceholder;
  };

  printPhrases = async () => {
    this.isCancelled = false;
    this.nextIndex = 0;
    let err = null;

    const run = async (phrase) => {
      // console.log('run', phrase);

      await this.printPhrase(phrase)
        .then(() => {
          // create loop
          if (this.nextIndex === this.phrases.length - 1) {
            this.nextIndex = 0;
          } else {
            this.nextIndex = this.nextIndex + 1;
          }

          if (!err) {
            run(this.phrases[this.nextIndex]);
          }
        })
        .catch((err) => {
          // console.log('rejected', err);
          err = err;
        });
    };

    await run(this.phrases[0]);
  };

  printPhrase = async (phrase) => {
    return new Promise((resolve, reject) => {
      // Clear placeholder before typing next phrase
      // TODO - remove letters
      if (!this.isCancelled) {
        this.clearPlaceholder(this.inputElement);

        let letters = phrase.split('');
        // For each letter in phrase
        letters.reduce(
          (promise, letter, index) =>
            promise.then((_) => {
              // stop the chain with flag
              if (this.isCancelled) {
                reject('cancelled');
                // this.stopAnimation();
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
      } else {
        reject('cancelled');
      }
    });
  };

  clearPlaceholder = (el) => {
    el.setAttribute('placeholder', '');
  };

  addToPlaceholder = (toAdd, el) => {
    el.setAttribute('placeholder', el.getAttribute('placeholder') + toAdd);

    return new Promise((resolve) => setTimeout(resolve, this.typingSpeed));
  };

  stopAnimation = () => {
    this.isCancelled = true;
    [50, 100, 500, 1000].forEach((t) => {
      setTimeout(() => {
        if (this.isCancelled) {
          this.inputElement.setAttribute('placeholder', this.defaultPlaceholder);
        }
      }, t);
    });
  };
}
