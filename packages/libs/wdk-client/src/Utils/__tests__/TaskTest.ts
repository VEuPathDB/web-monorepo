/**
 * Created by dfalke on 9/28/16.
 */
import { Task } from 'wdk-client/Utils/Task';
const noop = () => {};

describe('Task', () => {

  test('Task.of should create a Task from a value', () => {
    Task.of(20).run((v) => {
      expect(v).toBe(20);
    });
  });

  test('Task.reject should create a rejected Task from a value', () => {
    Task.reject('error').run(noop, (e) => {
      expect(e).toBe('error');
    });
  });

  test('Task#map should map the value of a Task, based on a map function', () => {
    Task.of(20).map((v) => v * v).run((v) => {
      expect(v).toBe(400);
    });
  });

  test('Task#mapRejected should map the rejected value of a Task, based on a map function', () => {
    Task.reject(20).mapRejected((v) => v * v).run(noop, (v) => {
      expect(v).toBe(400);
    });
  });

  test('Task#chain should allow the value of one Task to be used as the input of another Task', (done) => {
    expect.assertions(2);

    const task: Task<number, string> = Task.of(20);

    task.chain((v) => delayValue(v * v, 1000)).run((v) => {
      expect(v).toBe(400);
      done();
    });

    task.chain(() => Task.reject('fail') as Task<number, string>).run(noop, (e) => {
      expect(e).toBe('fail')
    });
  });

  test('Task#chainRejected should allow the rejected value of one Task to be used as the input of another Task', () => {
    Task.reject(20).chainRejected((e) => Task.of(e * 20)).run((v) => {
      expect(v).toBe(400)
    });
  });

  test('Task.fromPromise should create a Task from a Promise', t => {
    let cancel = Task.fromPromise(() => Promise.resolve(1))
      .run(() => void t.fail('this should cancel'));
    cancel();

    Task.fromPromise(() => Promise.resolve(10))
      .run(v => expect(v).toBe(10));

    setTimeout(() => t(), 1000);
  });

  test('Task.cancel should cancel the execution of a Task', t => {
    expect.assertions(1);
    let task = new Task(function(resolve) {
      setTimeout(resolve, 100, 1);
    });

    // this assertion should never be executed since the Task is immediately
    // cancelled. If it does execute, the test will fail since we planned for
    // 1 assertion, but will have made 2 assertions when `t.end()` is called.
    let cancel = task.run(v => expect(v).toBeTruthy());
    cancel();

    setTimeout(function() {
      expect(true).toBeTruthy();
      t();
    }, 200);
  });

});

function delayValue<E>(value: number, delay: number): Task<number, E> {
  return new Task(function(fulfill) {
    let id = setTimeout(fulfill, delay, value);
    return () => void clearTimeout(id);
  });
}
