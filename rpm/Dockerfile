FROM rpmbuild/centos7

USER root

WORKDIR /root/rpmbuild

RUN     yum -y install https://centos7.iuscommunity.org/ius-release.rpm epel-release
RUN     yum -y install python36 python36-devel python36-setuptools gcc-c++ make \
        &&  easy_install-3.6 pip \
        &&  curl -sL https://rpm.nodesource.com/setup_8.x | bash - \
        &&  yum install -y nodejs \
        &&  pip3.6 install -U pip setuptools pyinstaller

