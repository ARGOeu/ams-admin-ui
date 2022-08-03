pipeline {
    agent none
    options {
        checkoutToSubdirectory('ams-admin-ui')
        newContainerPerStage()
    }
    environment {
        PROJECT_DIR='ams-admin-ui'
    }
    stages {
        stage ('Build and Deploy ams-admin-ui') {
            agent {
                docker {
                    image 'node:lts-buster'
                }
            }
            steps {
                echo 'Build ams-admin-ui'
                withCredentials([file(credentialsId: 'ams-admin-ui-conf', variable: 'AMS_ADMIN_CONF')]) {
                    sh '''
                        cd $WORKSPACE/$PROJECT_DIR
                        rm ./src/config.js
                        cp $AMS_ADMIN_CONF ./src/
                        npm install
                        npm run build
                    '''
                }
                script {
                    if ( env.BRANCH_NAME == 'devel' ) {
                        sshagent (credentials: ['newgrnetci-ams-ui']) {
                            sh '''
                                cd $WORKSPACE/$PROJECT_DIR
                                ssh -o "StrictHostKeyChecking no" root@admin-ui.argo.grnet.gr rm -rf /var/www/admin-ui.argo.grnet.gr/*
                                scp -o "StrictHostKeyChecking no" -r  build/* root@admin-ui.argo.grnet.gr:/var/www/admin-ui.argo.grnet.gr/
                            '''
                        }
                    }
                }
            }
        }
    }
    post {
        success {
            script{
                if ( env.BRANCH_NAME == 'devel' ) {
                    slackSend( message: ":rocket: New version for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME !")
                    slackSend( message: ":satellite: New version of <$BUILD_URL|$PROJECT_DIR> Deployed successfully to devel!")
                }
                else if ( env.BRANCH_NAME == 'master' ) {
                    slackSend( message: ":rocket: New version for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME !")
                }
            }
        }
        failure {
            script{
                if ( env.BRANCH_NAME == 'master' || env.BRANCH_NAME == 'devel' ) {
                    slackSend( message: ":rain_cloud: Build Failed for <$BUILD_URL|$PROJECT_DIR>:$BRANCH_NAME Job: $JOB_NAME")
                }
            }
        }
    }
}