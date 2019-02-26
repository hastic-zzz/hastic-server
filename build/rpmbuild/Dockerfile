FROM rpmbuild/centos7

USER root

WORKDIR /root/rpmbuild

RUN    yum -y install https://centos7.iuscommunity.org/ius-release.rpm epel-release
RUN    yum -y install python36 python36-devel python36-setuptools gcc-c++ make \
    && easy_install-3.6 pip \
    && pip3.6 install -U pip setuptools pyinstaller \
    && curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash -
