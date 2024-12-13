#!/usr/bin/env bash

source "$(dirname "$0")/common.sh"

validate() {
  # requrired system parameters
  BITBUCKET_CLONE_DIR=${BITBUCKET_CLONE_DIR:?'BITBUCKET_CLONE_DIR variable missing.'}
  BITBUCKET_REPO_SLUG=${BITBUCKET_REPO_SLUG:?'BITBUCKET_REPO_SLUG variable missing.'}

  # optional parameters
  DEBUG=${DEBUG:="false"}
}

run_code_insight_report() {
    echo "ESLINT_TEST_JSON_INPUT: ${ESLINT_TEST_JSON_INPUT}"

    # need to initialize these
    status=0
    stdout_log=$(pwd)/${ESLINT_TEST_JSON_INPUT}
    stderr_log="/tmp/stderr.log"

    report
}

info "Starting pipe execution..."
enable_debug
validate
run_code_insight_report
