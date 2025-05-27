*** Settings ***
Documentation    Test suite for CloudNetMonitor Dashboard UI
Library    SeleniumLibrary
Library    Collections

*** Variables ***
${BROWSER}    chrome
${URL}    http://localhost:3000
${TIMEOUT}    10s

*** Test Cases ***
Public Dashboard Should Load
    Open Browser    ${URL}    ${BROWSER}
    Set Selenium Timeout    ${TIMEOUT}
    
    Wait Until Element Contains    xpath=//h1    CloudNet Monitor
    Page Should Contain Element    xpath=//h6[contains(text(), 'CPU Usage')]
    Page Should Contain Element    xpath=//h6[contains(text(), 'Memory Usage')]
    Page Should Contain Element    xpath=//h6[contains(text(), 'Network Usage')]
    
    Element Should Be Visible    xpath=//button[contains(text(), 'Admin Login')]
    [Teardown]    Close Browser

Login Page Should Load
    Open Browser    ${URL}/login    ${BROWSER}
    Set Selenium Timeout    ${TIMEOUT}
    
    Wait Until Element Contains    xpath=//h1    Login
    Page Should Contain Element    xpath=//input[@name='username']
    Page Should Contain Element    xpath=//input[@name='password']
    Page Should Contain Element    xpath=//button[contains(text(), 'Sign In')]
    [Teardown]    Close Browser

*** Keywords ***
Login As Admin
    [Arguments]    ${username}    ${password}
    Input Text    name=username    ${username}
    Input Text    name=password    ${password}
    Click Button    xpath=//button[contains(text(), 'Sign In')] 