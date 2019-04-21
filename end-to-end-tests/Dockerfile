FROM python

RUN apt update

RUN apt install -y firefox-esr

WORKDIR /srv/end-to-end-tests

COPY Pipfile Pipfile

COPY Pipfile.lock Pipfile.lock

RUN python3 -m pip install pipenv

RUN python3 -m pipenv install --system

COPY tests tests

CMD nosetests
