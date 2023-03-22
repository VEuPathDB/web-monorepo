import {
  latest,
  synchronized,
  Mutex
} from 'wdk-client/Utils/PromiseUtils';

// helpers

function timeout(ms: number): Promise<number> {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(ms);
    }, ms);
  });
}


describe('latest', () => {
  test('should replace the value with the most recent call', function() {
    let latestTimeout = latest(timeout);
    return Promise.race([
      latestTimeout(100).then(ms => expect(ms).toBe(400)),
      latestTimeout(200).then(ms => expect(ms).toBe(400)),
      latestTimeout(300).then(ms => expect(ms).toBe(400)),
      latestTimeout(400).then(ms => expect(ms).toBe(400))
    ]);
  });
});

describe('synchronized', () => {
  test('#synchronized should enqueue Promise factory execution until the previous executions have completed', function() {
    const synchronizedTimeout = synchronized(timeout);
    const called: number[] = [];
    return Promise.all([
      synchronizedTimeout(400).then(ms => called.push(ms)),
      synchronizedTimeout(300).then(ms => called.push(ms)),
      synchronizedTimeout(200).then(ms => called.push(ms)),
      synchronizedTimeout(100).then(ms => {
        called.push(ms);
        expect(ms).toBe(100);
        expect(called).toEqual([400, 300, 200, 100]);
      })
    ]);
  });
});

describe('Mutex', () => {
  test('should synchronize Promise factory execution', function() {
    const mutex = new Mutex();
    const called: number[] = [];
    const error = new Error("Inside synchronize.");
    const mss = [400,300,200,100];

    mss.forEach((ms, index) => {
      mutex.synchronize(() => {
        expect(index).toBe(called.length)
        return timeout(ms).then(ms => {
          called.push(ms)
        });
      });
    })

    mutex.synchronize(() => { throw error; }).catch(err => {
      expect(err).toBe(error);
    });

    return mutex.synchronize(() => Promise.resolve()).then(() => {
      expect(called).toEqual([400,300,200,100]);
    });

  });
});
