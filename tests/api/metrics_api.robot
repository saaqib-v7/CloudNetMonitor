*** Settings ***
Documentation    Test suite for CloudNetMonitor Metrics API
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}    http://localhost:3001
${METRICS_ENDPOINT}    /api/metrics/public

*** Test Cases ***
Get Public Metrics Should Return 200
    Create Session    api    ${BASE_URL}
    ${response}=    GET On Session    api    ${METRICS_ENDPOINT}
    Status Should Be    200    ${response}
    
    ${json}=    Set Variable    ${response.json()}
    Should Not Be Empty    ${json}
    
    ${first_metric}=    Get From List    ${json}    0
    Dictionary Should Contain Key    ${first_metric}    averageCpu
    Dictionary Should Contain Key    ${first_metric}    averageMemory
    Dictionary Should Contain Key    ${first_metric}    averageNetwork
    Dictionary Should Contain Key    ${first_metric}    timestamp

Get Protected Metrics Should Return 401 Without Token
    Create Session    api    ${BASE_URL}
    ${response}=    GET On Session    api    /api/nodes    expected_status=401
    Status Should Be    401    ${response}

*** Keywords ***
Status Should Be
    [Arguments]    ${expected_status}    ${response}
    Should Be Equal As Numbers    ${response.status_code}    ${expected_status} 