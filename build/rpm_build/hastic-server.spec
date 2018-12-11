%define name hastic-server
%define version 0.2.6_alpha_%{echo $GIT_HASH}
%define release 0
%define buildroot %(mktemp -ud %{_tmppath}/server/%{name}-%{version}-%{release}-XXXXXX)

Name: %{name}
Version: %{version}
Release: %{release}
Summary: hastic-server

Group: Installation Script
License: Apache-2.0
URL: hastic.io
BuildRoot: %{buildroot}
Requires: nodejs >= 6, python3
BuildRequires: nodejs
AutoReqProv: no
BuildArch: noarch

%description
REST server for managing data for analytics

%prep
mkdir -p %{buildroot}
cp -r ../server %{buildroot}
cp -r ../analytics %{buildroot}

%build
pushd %{buildroot}/analytics

save=$RPM_BUILD_ROOT
unset RPM_BUILD_ROOT

pip3 install -U pip setuptools pyinstaller
pip3 install -r requirements.txt
pyinstaller --additional-hooks-dir=pyinstaller_hooks --paths=analytics/ bin/server

export RPM_BUILD_ROOT=$save
popd

pushd %{buildroot}/server
npm prune --production
npm rebuild
popd

%install
mkdir -p %{_bindir}/hastic-server
cp -r ./ %{_bindir}/hastic-server

%post
#systemctl enable %{_bindir}/hastic-server/hastic-server.service
ln -s %{_bindir}/hastic-server/data /etc/hastic-server/data
ln -s %{_bindir}/hastic-server/config /etc/hastic-server/config


%clean
rm -rf %{buildroot}

%files
%defattr(644, hastic-server, hastic-server, 755)
/bin/hastic-server
/etc/hastic-server
