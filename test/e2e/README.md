Test API with pytest-bdd and webui with playwright

# Install dependencies

Make sure to have poetry installed

On a recent debian/ubuntu:

```
sudo apt install python3-poetry
```

on an older version

```
pip3 install poetry
```

```
poetry install
poetry run playwright install
```

# Run the tests

## In parallel

The project is configured to run 4 tests in parallel by default (in `pytest.ini`).
Just run

```
poetry run pytest
```

to run the tests in parallel

## Sequentially

```
poetry run pytest -n 1
```

## With a debuger

```
poetry run pytest --pdb
```

Add a `breakpoint()` in your code to jump in the debugger or wait for the code to crash
to go in the debugger in postmortem mode.

The command

```
poetry run pytest --trace
```

is also useful to debug a test from the begining. You usually want to combine this with
a selection of a specific test.

## Run a specific test

Just pass the test name in parameter:

```
poetry run pytest tests/test_star.py::should_be_able_to_login
```

## Display the browser in playwright

```
poetry run pytest --headed --slowmo=1000
```

The `--headed` option is used to display the browser. The inspector is available in the browser.
The `--headed` mode can be combined with the `--trace` or `--pdb` options.

The `--slowmo` parameter is the number of milliseconds between each action.


## Replay the test traces

The playwright test traces are stored in the `test-results` in case of failure
and can be replayed with

```
poetry run playwright show-trace ./test-results/tests-test-gui-py-test-authenticated-access-to-the-application/trace.zip
```
