#!/bin/bash

# Begin Standard 'imports'
set -e
set -o pipefail

gray="\\e[37m"
blue="\\e[36m"
red="\\e[31m"
green="\\e[32m"
reset="\\e[0m"

info() { echo -e "${blue}INFO: $*${reset}"; }
error() { echo -e "${red}ERROR: $*${reset}"; }
debug() {
    if [[ "${DEBUG}" == "true" ]]; then
        echo -e "${gray}DEBUG: $*${reset}";
    fi
}

success() { echo -e "${green}✔ $*${reset}"; }
fail() { echo -e "${red}✖ $*${reset}"; exit 1; }

## Enable debug mode.
enable_debug() {
  if [[ "${DEBUG}" == "true" ]]; then
    info "Enabling debug mode."
    set -x
  fi
}

# Execute code insight report script, saving its output and exit status code
report() {
  set +e
  stdout_report_log="/tmp/stdout_report.log"

  output=""
  echo "Generating report..."

  node /dist/main.js "${stdout_log}" 1> "${stdout_report_log}" 2>>"${stderr_log}"
  report_status=$?

  output="$(<"${stdout_report_log}")"
  output="Report succeed generated!!!${output}"
  if [[ "$report_status" -ne 0 ]]; then
    status=3 # custom exit code to indicate report error
    output="Report Error:${stdout_report_log}$(<"${stderr_log}")"
  fi

  set -e
  echo "${output}"
}

# End standard 'imports'
