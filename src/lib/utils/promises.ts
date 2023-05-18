// Insert into a promise chain and continue the chain with the received value.
// Example:
//
//   Without `middleman`:
//
//     Promise.resolve(123)
//       .then((n) => n + 7)
//       .then((n) => console.log(n))
//       .then((n) => typeof n)
//       .then((n) => console.log(n));
//
//     // Logs:
//     //=> 130
//     //=> undefined
//
//   With `middleman`:
//
//   Promise.resolve(123)
//     .then((n) => n + 7)
//     .then(middleman((n) => console.log(n)))
//     .then((n) => typeof n)
//     .then((n) => console.log(n));
//
//   // Logs:
//   //=> 130
//   //=> number
//
// Helpful when you want to run some `void` function without interrupting the
// chain with a function block just to return the received value. For example,
// these two are equivalent:
//
//   Promise.resolve(123)
//     .then((n) => n + 7)
//     .then((n) => {
//       console.log("Got here!");
//       return n;
//     })
//     .then((n) => n + 20)
//     .then((n) => console.log(n))
//
//   Promise.resolve(123)
//     .then((n) => n + 7)
//     .then(middleman(() => console.log("Got here!")))
//     .then((n) => n + 20)
//     .then((n) => console.log(n))
//
// You can also give `middleman` a `Promise` and it will resolve it before
// moving on:
//
//   Promise.resolve(123)
//     .then((n) => n + 7)
//     .then(middleman(Promise.resolve(999).then((m) => console.log(m))))
//     .then((n) => console.log(n))
//
//   // Logs:
//   //=> 999
//   //=> 130
export const middleman = <T>(
  digression: Promise<any> | ((resolvedValue: T) => any),
): ((resolvedValue: T) => Promise<T>) => {
  return (resolvedValue) =>
    new Promise((resolve, _reject) => {
      if ("then" in digression) {
        resolve(digression);
      } else {
        resolve(digression(resolvedValue));
      }
    }).then(() => resolvedValue);
};
