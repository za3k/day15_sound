run-debug:
	flask --debug run
run-demo:
	gunicorn3 -e SCRIPT_NAME=/hackaday/sound --bind 0.0.0.0:8015 app:app
