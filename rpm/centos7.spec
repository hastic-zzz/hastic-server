Name: hastic-server
Version: %(echo $RPM_PACKAGE_VERSION)
Release: %(echo $RPM_RELEASE)
Summary: REST server for managing data for analytics

Group: Applications/Engineering
URL: hastic.io
License: Apache-2.0
BuildArch: noarch
BuildRoot: /workspace

%description
REST server for managing data for analytics

#%prep


%build
cd $BuildRoot
make

#%install
sudo yum -y install epel-release gcc-c++ make python36 python36-devel python36-setuptools \
sudo easy_install-3.6 pip \
curl -sL https://rpm.nodesource.com/setup_8.x | sudo bash - \
sudo yum install -y nodejs


%files
%defattr(-,root,root)
$BuildRoot/analytics/bin/*
$BuildRoot/server/dist/server.js

%clean
make clean
rm -rf $RPM_BUILD_ROOT

#%post

#%changelog
