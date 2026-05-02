ifeq ($(OS),Windows_NT)
EXE := .cmd
else
EXE :=
endif

.PHONY: all clean

all: battletrace$(EXE)
	@:

battletrace: battletrace.mjs
	cp battletrace.mjs battletrace
	chmod +x battletrace

battletrace.cmd: battletrace.mjs
	echo @node "%~dp0battletrace.mjs" %%* > battletrace.cmd

clean:
	$(RM) battletrace battletrace.cmd
